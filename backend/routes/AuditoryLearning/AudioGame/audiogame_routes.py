from flask import Blueprint, request, jsonify
import tensorflow as tf
import numpy as np
from utils.AuditoryLearning.AudioGame.gamedb_utils import GameDatabase

audiogame_routes = Blueprint("audiogame_routes", __name__)

model = r'C:\Users\Dilshan\Desktop\Blooming-Minds\models\saved_models\Auditory\audio_game_model.h5'


@audiogame_routes.route("/add_audiogame", methods=["POST"])
def add_audiogame():
    db = GameDatabase()
    try:
        game_data = request.get_json()
        if "number" not in game_data or "questions" not in game_data:
            return jsonify({"error": "Missing required fields"}), 400

        for question in game_data["questions"]:
            required_fields = ["question", "answers", "images", "correct_answer"]
            if not all(key in question for key in required_fields):
                return jsonify({"error": "Missing fields in a question"}), 400
            if len(question["answers"]) != len(question["images"]):
                return jsonify({"error": "Answers and images count mismatch"}), 400
            if question["correct_answer"] not in question["answers"]:
                return jsonify(
                    {"error": "Correct answer must be one of the provided answers"}
                ), 400

        # Insert each question into the database under the same number
        for question in game_data["questions"]:
            question["number"] = game_data["number"]
            db.insert_game("audiogames", question)

        return jsonify({"message": "Audiogames added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()


@audiogame_routes.route("/get_audiogames", methods=["GET"])
def get_audiogames():
    db = GameDatabase()
    try:
        games = db.get_games("audiogames")
        if not games:
            return jsonify({"message": "No audiogames found"}), 404
        return jsonify({"audiogames": games}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()

@audiogame_routes.route("/get_audiogame/<game_id>", methods=["GET"])
def get_audiogame(game_id):
    db = GameDatabase()
    try:
        game = db.get_game_by_id("audiogames", game_id)
        if not game:
            return jsonify({"message": "Audiogame not found"}), 404
        return jsonify({"audiogame": game}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()
        
@audiogame_routes.route("/add_audiogame_result", methods=["POST"])
def add_audiogame_result():
    db = GameDatabase()
    try:
        result_data = request.get_json()
        required_fields = [
            "user_id", "lesson_number", "question_number", "response_correctness", "response_time"
        ]

        if not all(field in result_data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Insert the result into the database
        result_id = db.insert_audiogame_result(result_data)
        return jsonify({"message": "Audiogame result added successfully", "id": result_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()


@audiogame_routes.route("/get_audiogame_results", methods=["GET"])
def get_audiogame_results():
    db = GameDatabase()
    try:
        # Fetch all audiogame results from the database
        results = db.get_audiogame_results()  # Fetch results specifically from the audiogame_results collection
        if not results:
            return jsonify({"message": "No audiogame results found"}), 404
        return jsonify({"audiogame_results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()

# New route to handle adding audiogame analysis
@audiogame_routes.route("/add_audiogame_analysis", methods=["POST"])
def add_audiogame_analysis():
    db = GameDatabase()
    try:
        analysis_data = request.get_json()
        required_fields = [
            "user_id", "session_id", "question_id", "response_correctness", 
            "response_time", 
        ]

        # Check if all required fields are present
        if not all(field in analysis_data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Insert the analysis data into the database
        analysis_id = db.insert_analysis(analysis_data)
        return jsonify({"message": "Audiogame analysis added successfully", "id": analysis_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()

