from flask import Blueprint, request, jsonify
from utils.AuditoryLearning.AudioBook.db_utils import Database

lesson_routes = Blueprint("lesson_routes", __name__)

@lesson_routes.route("/add_lesson", methods=["POST"])
def add_lesson():
    """
    API endpoint to add a new lesson to the database.
    Expects a JSON body with lesson data.
    """
    db = Database()
    try:
        # Get JSON data from the request
        lesson_data = request.get_json()

        # Validate required fields
        if not all(key in lesson_data for key in ( "title", "text", "questions")):
            return jsonify({"error": "Missing required fields"}), 400

        # Insert data into the 'audio_lessons' collection
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
        print("Fetching lessons...")  # Debug log
        lessons = db.get_data("audio_lessons")
        print(f"Lessons fetched: {lessons}")  # Debug log

        if not lessons:
            return jsonify({"message": "No lessons found"}), 404

        return jsonify({"lessons": lessons}), 200
    except Exception as e:
        print(f"Error in /get_lessons: {e}")  # Log the error
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()
