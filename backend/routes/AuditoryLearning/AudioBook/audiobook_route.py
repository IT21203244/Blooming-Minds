from flask import Blueprint, request, jsonify
import logging
import traceback
from utils.AuditoryLearning.AudioBook.database import Database  # Import the Database class

insert_routes = Blueprint("insert_routes", __name__)
db = Database()  # Create a single database instance

@insert_routes.route('/insert_transcription', methods=['POST'])
def insert_transcription():
    """
    Inserts transcription correctness data into the database.
    """
    try:
        data = request.get_json()
        user_id = data.get("userId")
        lesson_id = data.get("lessonId")
        correctness = data.get("correctness")

        if not user_id or not lesson_id or correctness is None:
            return jsonify({"error": "Missing required fields"}), 400

        # Insert into database
        db.insert_transcription_data(user_id, lesson_id, correctness)

        return jsonify({"message": "Transcription data inserted successfully"}), 200
    except Exception as e:
        logging.error(f"Error inserting transcription data: {e}")
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500

@insert_routes.route('/get_transcriptions', methods=['GET'])
def get_transcriptions():
    """
    Retrieves all transcriptions from the database.
    """
    try:
        transcriptions = db.get_all_transcriptions()
        return jsonify({"transcriptions": transcriptions}), 200
    except Exception as e:
        logging.error(f"Error fetching transcriptions: {e}")
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500
