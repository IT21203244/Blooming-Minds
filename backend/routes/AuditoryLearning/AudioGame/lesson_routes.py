from flask import Blueprint, request, jsonify
from utils.AuditoryLearning.AudioBook.db_utils import Database

lesson_routes = Blueprint("lesson_routes", __name__)

@lesson_routes.route("/add_lesson", methods=["POST"])
def add_lesson():
    db = Database()
    try:
        lesson_data = request.get_json()
        # Validate the required fields
        if not all(key in lesson_data for key in ("title", "text", "questions", "imageURL")):
            return jsonify({"error": "Missing required fields"}), 400
        # Insert the data into the database
        inserted_id = db.insert_data("audio_lessons", lesson_data)
        return jsonify({"message": "Lesson added successfully", "id": str(inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()


@lesson_routes.route("/get_lessons", methods=["GET"])
def get_lessons():
    db = Database()
    try:
        lessons = db.get_data("audio_lessons")
        if not lessons:
            return jsonify({"message": "No lessons found"}), 404
        return jsonify({"lessons": lessons}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()

@lesson_routes.route("/get_lesson/<lesson_id>", methods=["GET"])
def get_lesson(lesson_id):
    db = Database()
    try:
        lesson = db.get_data_by_id("audio_lessons", lesson_id)
        if not lesson:
            return jsonify({"message": "Lesson not found"}), 404
        return jsonify({"lesson": lesson}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()
