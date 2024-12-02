from flask import Blueprint, request, jsonify
from utils.AuditoryLearning.AudioGame.gamedb_utils import GameDatabase

audiogame_routes = Blueprint("audiogame_routes", __name__)

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
