from flask import Blueprint, jsonify, request
import random
from utils.VisualLearning.math_reinforcement_learning import adjust_difficulty
from utils.VisualLearning.db_util import insert_math_game_session
import logging
import time

math_learning_routes = Blueprint("math_learning_routes", __name__)

# Define operations
OPERATIONS = {
    "addition": "+",
    "subtraction": "-",
    "multiplication": "*",
    "division": "/"
}

# Difficulty ranges per level
DIFFICULTY_RANGES = {
    "easy": (1, 10),
    "medium": (1, 30),
    "hard": (10, 60)
}

def generate_math_problem(concept, level):
    """Generate math problems based on concept and difficulty level."""
    if concept not in OPERATIONS:
        return None, None, None, None, None

    min_val, max_val = DIFFICULTY_RANGES.get(level, (1, 10))
    
    num1 = random.randint(min_val, max_val)
    num2 = random.randint(min_val, max_val)
    operation = OPERATIONS[concept]

    # Ensure valid division
    if concept == "division":
        num2 = random.randint(1, max_val)  # Avoid division by zero
        num1 = num2 * random.randint(1, max_val // num2)  # Ensure clean division

    problem = f"{num1} {operation} {num2}"
    answer = eval(problem)

    return problem, answer, num1, num2, operation

@math_learning_routes.route('/generate_problem', methods=['GET'])
def get_problem():
    """API to return a math problem for a specific concept and level."""
    concept = request.args.get('concept', 'addition').lower()
    level = request.args.get('level', 'easy').lower()

    problem, answer, num1, num2, operation = generate_math_problem(concept, level)

    if problem is None:
        return jsonify({"error": "Invalid math concept"}), 400

    return jsonify({
        "problem": problem,
        "concept": concept,
        "level": level,
        "num1": num1,
        "num2": num2,
        "operator": operation,
        "correct_answer": answer  # Include the correct answer in the response
    })

@math_learning_routes.route('/submit_answer', methods=['POST'])
def submit_answer():
    """API to check the answer and adjust difficulty per concept."""
    try:
        data = request.json
        user_id = data.get('user_id')
        concept = data.get('concept').lower()
        problem = data.get('problem')
        user_answer = int(data.get('user_answer'))
        correct_answer = data.get('correct_answer')  # Get the correct answer from the request
        level = data.get('level')
        first_number = data.get('first_number')
        second_number = data.get('second_number')
        time_taken_first = data.get('time_taken_first')
        time_taken_second = data.get('time_taken_second')
        combined_result = data.get('combined_result')  # Get the combined result from the request

        # Ensure level is valid
        if level not in DIFFICULTY_RANGES:
            level = "easy"

        is_correct = user_answer == correct_answer
        is_combined_correct = combined_result == correct_answer if combined_result is not None else None

        # Adjust difficulty based on both answers
        if is_combined_correct is not None:
            is_correct = is_correct and is_combined_correct

        new_level = adjust_difficulty(user_id, concept, level, is_correct)

        # Save session result
        insert_math_game_session(
            user_id=user_id,
            concept=concept,
            problem=problem,
            user_answer=user_answer,
            is_correct=is_correct,
            level=new_level,
            first_number=first_number,
            second_number=second_number,
            time_taken_first=time_taken_first,
            time_taken_second=time_taken_second,
            combined_result=combined_result,
            is_combined_correct=is_combined_correct
        )

        return jsonify({
            "is_correct": is_correct,
            "new_level": new_level
        })

    except Exception as e:
        logging.error(f"Error in submit_answer: {str(e)}")
        return jsonify({"error": str(e)}), 500