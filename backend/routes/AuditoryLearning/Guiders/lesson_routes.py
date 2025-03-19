from flask import Blueprint, request, jsonify, send_from_directory, current_app
from utils.AuditoryLearning.AudioBook.db_utils import Database
import os
import requests  # Added missing import

lesson_routes = Blueprint("lesson_routes", __name__)

UPLOAD_FOLDER = 'uploads/audio'
ALLOWED_EXTENSIONS = {'mp3'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@lesson_routes.route('/uploads/audio/<filename>')
def uploaded_audio(filename):
    if not allowed_file(filename):
        return jsonify({"error": "File type not allowed"}), 400
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_user_id_from_local_storage():
    # Implement this function to retrieve the user ID from local storage
    pass

def calculate_average_correctness(correctness_data):
    # Implement this function to calculate the average correctness
    pass

@lesson_routes.route("/add_lesson", methods=["POST"])
def add_lesson():
    db = Database()
    try:
        lesson_data = {
            "lnumber": request.form.get("lnumber"),
            "title": request.form.get("title"),
            "text": request.form.get("text"),
            "imageURL": request.form.get("imageURL"),
            "audiobook_type": request.form.get("audiobook_type"),  # New field
        }

        audio_files = request.files.getlist("audio_files")
        lesson_audio_paths = []
        for audio_file in audio_files:
            if audio_file and allowed_file(audio_file.filename):
                filename = os.path.join(UPLOAD_FOLDER, audio_file.filename)
                audio_file.save(filename)
                lesson_audio_paths.append(f"/api/uploads/audio/{audio_file.filename}")

        questions = []
        index = 1
        while f"question_audio_{index}" in request.files:
            audio_file = request.files[f"question_audio_{index}"]
            answer = request.form.get(f"question_answer_{index}", "")

            if audio_file and allowed_file(audio_file.filename):
                filename = os.path.join(UPLOAD_FOLDER, audio_file.filename)
                audio_file.save(filename)
                questions.append({"audio": f"/api/uploads/audio/{audio_file.filename}", "answer": answer})
            
            index += 1

        lesson_data["audio_files"] = lesson_audio_paths
        lesson_data["questions"] = questions

        inserted_id = db.insert_data("audio_lessons", lesson_data)
        return jsonify({"message": "Lesson added successfully", "id": str(inserted_id)}), 201
    except Exception as e:
        current_app.logger.error(f"Error in add_lesson: {str(e)}")
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
        current_app.logger.error(f"Error in get_lessons: {str(e)}")
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
        current_app.logger.error(f"Error in get_lesson: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()

@lesson_routes.route("/recommended_lessons", methods=["GET"])
def recommended_lessons():
    db = Database()
    try:
        lessons = db.get_data("audio_lessons")
        if not lessons:
            return jsonify({"message": "No lessons found"}), 404
        return jsonify({"lessons": lessons}), 200
    except Exception as e:
        current_app.logger.error(f"Error in recommended_lessons: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()

@lesson_routes.route("/recommending_lessons", methods=["POST"])
def recommending_lessons():
    db = Database()
    try:
        user_id = get_user_id_from_local_storage()
        correctness_url = f"http://localhost:5000/api/get_transcriptions?user_id={user_id}"
        response = requests.get(correctness_url)
        
        if response.status_code != 200:
            current_app.logger.error(f"Failed to fetch user correctness: {response.status_code}, {response.text}")
            return jsonify({"error": "Failed to fetch user correctness"}), 500
        
        correctness_data = response.json()
        average_correctness = calculate_average_correctness(correctness_data)
        
        lessons = db.get_data("audio_lessons")
        if not lessons:
            return jsonify({"message": "No lessons found"}), 404
        
        if average_correctness < 80:
            recommended_lessons = [lesson for lesson in lessons if lesson["audiobook_type"] == "one word answer question"]
        else:
            recommended_lessons = [lesson for lesson in lessons if lesson["audiobook_type"] == "two word answer question"]
        
        return jsonify({"lessons": recommended_lessons}), 200
    
    except Exception as e:
        current_app.logger.error(f"Error in recommending_lessons: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()