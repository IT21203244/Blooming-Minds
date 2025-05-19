import logging
import os
import numpy as np
from flask import Blueprint, request, jsonify, g
from utils.VisualLearning.db_util import (
    insert_color_matching_result,
    get_color_matching_results,
    get_first_result_per_level, 
    get_rewards, 
    insert_reward,
    get_user_color_patterns,
    update_user_color_profile
)
from utils.auth.token_auth import token_required
from utils.VisualLearning.rl_agent import RLAgent
from utils.VisualLearning.state_action_manager import state_from_performance, action_to_level
from utils.VisualLearning.reward_system import calculate_reward, determine_reward_type
from utils.VisualLearning.colorPredictor import ColorPredictor

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

color_matching_routes = Blueprint("color_matching_routes", __name__)

# Define level constants
LEVELS = {"easy": 0, "medium": 1, "hard": 2}
LEVEL_CIRCLE_COUNTS = {"easy": 3, "medium": 5, "hard": 7}

# Initialize RL agent and LSTM predictor
STATE_SIZE = 6  # Must match state_from_performance output
ACTION_SIZE = 3
MODEL_PATH = "E:/BloomingMinds/ml-models/scripts/VisualLearning/color_matching_model_weights.keras"

# Initialize RL agent - always create new instance with correct architecture
rl_agent = RLAgent(STATE_SIZE, ACTION_SIZE)

# Try to load weights if model exists, otherwise start fresh
if os.path.exists(MODEL_PATH):
    try:
        rl_agent.load_model(MODEL_PATH)
        logger.info("Successfully loaded existing RL model weights")
    except Exception as e:
        logger.warning(f"Failed to load model weights: {str(e)}. Creating new model.")
        rl_agent = RLAgent(STATE_SIZE, ACTION_SIZE)

# Initialize color predictor
color_predictor = ColorPredictor()

success_count = 0
total_episodes = 0

@color_matching_routes.route('/color_matching_game', methods=['POST'])
@token_required
def color_matching_game():
    global success_count, total_episodes

    try:
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided."}), 400

        # Extract required fields
        required_fields = [
            "level", "wrong_takes", "correct_takes", "total_score",
            "time_taken", "circle_count", "date", "response_times", 
            "mistake_patterns", "streak", "provided_sequence", "child_sequence"
        ]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        level = data.get("level")
        wrong_takes = data.get("wrong_takes", 0)
        correct_takes = data.get("correct_takes", 0)
        total_score = data.get("total_score", 0)
        time_taken = data.get("time_taken", 0)
        provided_sequence = data.get("provided_sequence", [])
        child_sequence = data.get("child_sequence", [])
        circle_count = data.get("circle_count", 0)
        date = data.get("date")
        response_times = data.get("response_times", [])
        mistake_patterns = data.get("mistake_patterns", {})
        streak = data.get("streak", 0)

        user_id = g.user_id
        expected_circle_count = LEVEL_CIRCLE_COUNTS.get(level)
        if expected_circle_count is None:
            return jsonify({"error": "Invalid level provided."}), 400

        wrong_circle_count = abs(expected_circle_count - circle_count)

        # Generate state and calculate additional metrics
        performance = {
            "level": level,
            "wrong_takes": wrong_takes,
            "correct_takes": correct_takes,
            "time_taken": time_taken,
            "response_times": response_times,
            "mistake_patterns": mistake_patterns,
            "streak": streak
        }
        
        # Update color profile with new mistake patterns
        update_user_color_profile(user_id, mistake_patterns, provided_sequence, child_sequence)

        state = state_from_performance(performance)
        accuracy_percentage = (correct_takes / (correct_takes + wrong_takes)) * 100 if (correct_takes + wrong_takes) > 0 else 0
        time_efficiency = 30 / time_taken if time_taken > 0 else 1

        performance.update({"accuracy_percentage": accuracy_percentage, "time_efficiency": time_efficiency})

        # Determine if this is a terminal state (game completed)
        done = accuracy_percentage >= 80  # Slightly lowered threshold
        
        # Adjust reward based on performance
        reward = calculate_reward(performance)
        
        # Get action from RL agent (this recommends difficulty level)
        action = rl_agent.act(state)
        recommended_level = action_to_level(action, accuracy_percentage, time_efficiency)

        # If user did exceptionally well, consider recommending higher level
        if accuracy_percentage >= 90 and time_efficiency >= 1.2:
            current_level_idx = list(LEVELS.keys()).index(level)
            if current_level_idx < len(LEVELS) - 1:
                recommended_level = list(LEVELS.keys())[current_level_idx + 1]

        # Insert result into the database
        result_id = insert_color_matching_result(
            user_id=user_id,
            level=level,
            wrong_takes=wrong_takes,
            correct_takes=correct_takes,
            total_score=total_score,
            time_taken=time_taken,
            provided_sequence=provided_sequence,
            child_sequence=child_sequence,
            circle_count=circle_count,
            wrong_circle_count=wrong_circle_count,
            date=date,
            accuracy=accuracy_percentage,
            time_efficiency=time_efficiency,
            reward=reward,
            response_times=response_times,
            mistake_patterns=mistake_patterns
        )

        # Update RL agent with new experience
        next_state = state_from_performance(performance)
        rl_agent.remember(state, action, reward, next_state, done=done)

        if len(rl_agent.memory) >= 32:
            rl_agent.replay(batch_size=32)

        # Save the model with the current architecture
        rl_agent.save_model(MODEL_PATH)

        # Calculate and log success rate
        total_episodes += 1
        if done:
            success_count += 1
        success_rate = (success_count / total_episodes) * 100 if total_episodes > 0 else 0
        logger.info(f"Success Rate: {success_rate:.2f}%")

        # Insert reward if the user performed well
        reward_type = None
        if accuracy_percentage >= 80:  # Lowered threshold for rewards
            rewards = get_rewards(user_id)
            total_rewards_accumulated = sum(reward["quantity"] for reward in rewards)
            reward_type = determine_reward_type(streak, total_rewards_accumulated)
            insert_reward(user_id, reward_type, 1, date)

        # Generate personalized color suggestions for next round
        color_suggestions = color_predictor.generate_suggestions(user_id, recommended_level)

        return jsonify({
            "message": "Result saved successfully.",
            "result_id": result_id,
            "recommended_level": recommended_level,
            "reward": reward_type if accuracy_percentage >= 80 else None,
            "color_suggestions": color_suggestions
        }), 201

    except Exception as e:
        logger.error(f"Error processing game data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@color_matching_routes.route('/get_color_suggestions', methods=['GET'])
@token_required
def get_color_suggestions():
    try:
        user_id = g.user_id
        level = request.args.get('level', 'easy')
        color_suggestions = color_predictor.generate_suggestions(user_id, level)
        return jsonify({"color_suggestions": color_suggestions}), 200
    except Exception as e:
        logger.error(f"Error getting color suggestions: {str(e)}")
        return jsonify({"error": str(e)}), 500

@color_matching_routes.route('/color_matching_game/rewards', methods=['GET'])
@token_required
def fetch_rewards():
    try:
        user_id = g.user_id
        rewards = get_rewards(user_id)
        return jsonify({"rewards": rewards}), 200
    except Exception as e:
        logger.error(f"Error fetching rewards: {str(e)}")
        return jsonify({"error": str(e)}), 500

@color_matching_routes.route('/color_matching_game', methods=['GET'])
@token_required
def fetch_color_matching_results():
    try:
        user_id = g.user_id
        results = get_color_matching_results(user_id=user_id) or []
        return jsonify({"results": results}), 200
    except Exception as e:
        logger.error(f"Error fetching results: {str(e)}")
        return jsonify({"error": str(e)}), 500

@color_matching_routes.route('/color_matching_game/first_result', methods=['GET'])
@token_required
def fetch_first_color_matching_result():
    try:
        user_id = g.user_id
        results = get_first_result_per_level(user_id=user_id)

        if not results:
            return jsonify({"message": "No results found for the user."}), 404

        return jsonify({"results": results}), 200

    except Exception as e:
        logger.error(f"Error fetching the first result: {str(e)}")
        return jsonify({"error": str(e)}), 500


@color_matching_routes.route('/compare_progress', methods=['GET'])
@token_required
def compare_progress():
    try:
        user_id = g.user_id

        # Get the first results per level (easy, medium, hard)
        first_results = get_first_result_per_level(user_id)

        if not first_results:
            return jsonify({"message": "No initial results found for the user."}), 404
        
        # Get all results for the user
        all_results = get_color_matching_results(user_id)
        
        # Initialize a dictionary to store comparison results
        progress_comparison = {}

        # Group results by level (easy, medium, hard)
        grouped_results = {'easy': [], 'medium': [], 'hard': []}
        
        for result in all_results:
            level = result['level']
            if level in grouped_results:
                grouped_results[level].append(result)

        # Compare each group of results with the first result and pair them
        for level, results in grouped_results.items():
            if not results:
                continue

            # Get the first result for the level
            first_result = first_results.get(level)
            if not first_result:
                continue  # Skip if no first result for the level

            # Initialize the comparison list for the level
            comparison_data = []

            # Pair the first result with subsequent results at the same level
            for result in results:
                comparison = {
                    'first_result': {
                        'accuracy': first_result['accuracy'],
                        'time_efficiency': first_result['time_efficiency'],
                        'reward': first_result['reward'],
                        'date': first_result.get('date')
                    },
                    'current_result': {
                        'accuracy': result['accuracy'],
                        'time_efficiency': result['time_efficiency'],
                        'reward': result['reward'],
                        'date': result.get('date')
                    },
                    'accuracy_diff': result['accuracy'] - first_result['accuracy'],
                    'time_efficiency_diff': result['time_efficiency'] - first_result['time_efficiency'],
                    'reward_diff': result['reward'] - first_result['reward']
                }
                comparison_data.append(comparison)

            # Store comparison data for the level
            progress_comparison[level] = comparison_data
        
        return jsonify(progress_comparison), 200

    except Exception as e:
        logger.error(f"Error comparing progress: {str(e)}")
        return jsonify({"error": str(e)}), 500