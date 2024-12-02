from flask import Blueprint, request, jsonify
from utils.AuditoryLearning.AudioGame.gamedb_utils import GameDatabase

audiogame_routes = Blueprint("audiogame_routes", __name__)

@audiogame_routes.route("/add_audiogame", methods=["POST"])
def add_audiogame():
    db = GameDatabase()
    try:
        game_data = request.get_json()
        # Validate input data
        required_fields = ["question", "answers", "images", "correct_answer"]
        if not all(key in game_data for key in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        if len(game_data["answers"]) != len(game_data["images"]):
            return jsonify({"error": "Answers and images count mismatch"}), 400
        if game_data["correct_answer"] not in game_data["answers"]:
            return jsonify({"error": "Correct answer must be one of the provided answers"}), 400

        # Insert data into the database
        inserted_id = db.insert_game("audiogames", game_data)
        return jsonify({"message": "Audiogame added successfully", "id": str(inserted_id)}), 201
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
