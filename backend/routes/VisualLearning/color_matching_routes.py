import logging
import os
from flask import Blueprint, request, jsonify, g
from utils.VisualLearning.db_util import (
    insert_color_matching_result,
    get_color_matching_results,
    get_first_result_per_level, get_rewards, insert_reward
)
from utils.auth.token_auth import token_required
from utils.VisualLearning.rl_agent import RLAgent
from utils.VisualLearning.state_action_manager import state_from_performance, action_to_level
from utils.VisualLearning.reward_system import calculate_reward, determine_reward_type

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

color_matching_routes = Blueprint("color_matching_routes", __name__)

LEVEL_CIRCLE_COUNTS = {"easy": 3, "medium": 5, "hard": 7}

# Initialize RL agent with appropriate state and action sizes
STATE_SIZE = 4  # Adjust based on state representation
ACTION_SIZE = 3  # Number of difficulty levels
MODEL_PATH = "E:/BloomingMinds/ml-models/scripts/VisualLearning/color_matching_model_weights.keras"

# Check if model exists, and load it or initialize a new agent
if os.path.exists(MODEL_PATH):
    rl_agent = RLAgent(STATE_SIZE, ACTION_SIZE, model_path=MODEL_PATH)
else:
    rl_agent = RLAgent(STATE_SIZE, ACTION_SIZE)

success_count = 0
total_episodes = 0

@color_matching_routes.route('/color_matching_game', methods=['POST'])
@token_required
def color_matching_game():
    global success_count, total_episodes  # Declare variables as global

    try:
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided."}), 400

        # Extract required fields
        required_fields = [
            "level", "wrong_takes", "correct_takes", "total_score",
            "time_taken", "circle_count", "date", "response_times", "mistake_patterns", "streak"
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
        streak = data.get("streak", 0)  # Get streak from the request data

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
            "streak": streak  # Include streak in performance metrics
        }
        state = state_from_performance(performance)
        accuracy_percentage = (correct_takes / (correct_takes + wrong_takes)) * 100 if (correct_takes + wrong_takes) > 0 else 0
        time_efficiency = 30 / time_taken if time_taken > 0 else 1  # Example average time benchmark

        performance.update({"accuracy_percentage": accuracy_percentage, "time_efficiency": time_efficiency})

        # Define terminal state condition based on accuracy
        done = False
        if accuracy_percentage >= 90:  # Terminal state if accuracy is above 90%
            done = True
            success_count += 1  # Increment success count for episodes with accuracy >= 90%

        action = rl_agent.act(state)
        recommended_level = action_to_level(action)
        reward = calculate_reward(performance)

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
        next_state = state_from_performance(performance)  # Assuming no significant state change
        rl_agent.remember(state, action, reward, next_state, done=done)

        # Replay and save model
        if len(rl_agent.memory) >= 32:  # Adjust batch size threshold as needed
            rl_agent.replay(batch_size=32)

        rl_agent.save_model(MODEL_PATH)

        # Calculate and log success rate
        total_episodes += 1
        success_rate = (success_count / total_episodes) * 100 if total_episodes > 0 else 0
        logger.info(f"Success Rate: {success_rate:.2f}%")

        # Insert reward if the user performed well
        if accuracy_percentage >= 90:
            # Fetch total rewards accumulated by the user
            rewards = get_rewards(user_id)
            total_rewards_accumulated = sum(reward["quantity"] for reward in rewards)

            # Determine reward type based on streaks and total rewards
            reward_type = determine_reward_type(streak, total_rewards_accumulated)
            insert_reward(user_id, reward_type, 1, date)

        return jsonify({
            "message": "Result saved successfully.",
            "result_id": result_id,
            "recommended_level": recommended_level,
            "reward": reward_type if accuracy_percentage >= 90 else None
        }), 201

    except Exception as e:
        logger.error(f"Error processing game data: {str(e)}")
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
