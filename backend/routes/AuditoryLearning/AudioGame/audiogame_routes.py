import os
from flask import Blueprint, request, jsonify
import tensorflow as tf
import numpy as np
from werkzeug.utils import secure_filename
from utils.AuditoryLearning.AudioGame.gamedb_utils import GameDatabase

audiogame_routes = Blueprint("audiogame_routes", __name__)

# Load the model globally
MODEL_PATH = r'backend/routes/AuditoryLearning/audio_game_model.h5'

try:
    model = tf.keras.models.load_model(
        MODEL_PATH,
        custom_objects={"mse": tf.keras.losses.MeanSquaredError()}
    )
except Exception as e:
    model = None
    print(f"Error loading the model: {e}")

UPLOAD_FOLDER = 'uploads/audio'
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg'}

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@audiogame_routes.route("/add_audiogame", methods=["POST"])
def add_audiogame():
    db = GameDatabase()
    try:
        # Get form data
        game_data = request.form
        if "number" not in game_data or "questions" not in game_data:
            return jsonify({"error": "Missing required fields"}), 400

        import json
        questions = json.loads(game_data["questions"])

        for index, question in enumerate(questions):
            required_fields = ["answers", "images", "correct_answer"]
            if not all(key in question for key in required_fields):
                return jsonify({"error": "Missing fields in a question"}), 400
            if len(question["answers"]) != len(question["images"]):
                return jsonify({"error": "Answers and images count mismatch"}), 400
            if question["correct_answer"] not in question["answers"]:
                return jsonify(
                    {"error": "Correct answer must be one of the provided answers"}
                ), 400

            # Handle multiple audio file uploads
            audio_key = f"audio_{index}"
            if audio_key in request.files:
                audio_file = request.files[audio_key]
                if audio_file and allowed_file(audio_file.filename):
                    filename = secure_filename(audio_file.filename)
                    file_path = os.path.join(UPLOAD_FOLDER, filename)
                    audio_file.save(file_path)
                    question["audio"] = file_path  # Store path in DB

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

        result_id = db.insert_audiogame_result(result_data)
        return jsonify({"message": "Audiogame result added successfully", "id": result_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()

@audiogame_routes.route("/predict_session_score", methods=["POST"])
def predict_session_score():
    """
    Predict the session score based on input features.
    """
    if model is None:
        return jsonify({"error": "Model is not loaded"}), 500

    try:
        # Parse the input data
        input_data = request.get_json()
        if not input_data or "features" not in input_data:
            return jsonify({"error": "Missing required field 'features'"}), 400

        # Prepare the features for prediction
        features = np.array(input_data["features"]).reshape(1, 3)  # Ensure shape is (1, 3)

        # Predict using the loaded model
        prediction = model.predict(features)
        session_score = float(prediction[0][0])  # Convert to regular float

        return jsonify({"session_score": session_score}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@audiogame_routes.route("/get_attempt_count", methods=["GET"])
def get_attempt_count():
    db = GameDatabase()
    try:
        # Fetch all audiogame results from the database
        results = db.get_audiogame_results()
        if not results:
            return jsonify({"message": "No audiogame results found"}), 404
        
        # Create a dictionary to store the attempt count for each lesson
        attempt_count = {}
        for result in results:
            lesson_number = result['lesson_number']
            if lesson_number in attempt_count:
                attempt_count[lesson_number] += 1
            else:
                attempt_count[lesson_number] = 1
        
        return jsonify({"attempt_count": attempt_count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close_connection()