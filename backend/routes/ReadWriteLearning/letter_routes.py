from flask import Blueprint, jsonify, request, g, send_from_directory
from PIL import Image
from io import BytesIO
import base64
import os
import requests
from datetime import datetime
from utils.ReadWriteLearning.ml_utils import predict_letter, calculate_pixel_accuracy, predict_attempts_to_95
from utils.ReadWriteLearning.db_util import Database
from utils.auth.token_auth import token_required

letter_routes = Blueprint('letter_routes', __name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "backend", "uploaded_letters")
PLOT_FOLDER = os.path.join(BASE_DIR, "backend", "plots")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PLOT_FOLDER, exist_ok=True)

# List of all letters (uppercase and lowercase)
ALL_LETTERS = [chr(i) for i in range(65, 91)] + [chr(i) for i in range(97, 123)]

@letter_routes.route('/get_all_letters', methods=['GET'])
@token_required
def get_all_letters():
    """
    Fetch all available letters (uppercase and lowercase).
    """
    try:
        return jsonify({
            'letters': ALL_LETTERS
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@letter_routes.route('/get_ideal_letter_data', methods=['GET'])
@token_required
def get_ideal_letter_data():
    db = Database()
    try:
        system_letter = request.args.get('system_letter')
        letter_case = request.args.get('case')
        
        if not system_letter or not letter_case:
            return jsonify({'error': 'Missing system_letter or case parameter'}), 400

        # Fetch ideal letter data from the database
        ideal_data = db.get_ideal_letter_url(system_letter, letter_case.lower())
        
        if not ideal_data:
            return jsonify({'error': 'No ideal letter data found for the given letter and case'}), 404

        return jsonify({
            'pic_image_url': ideal_data['pic_image_url'],
            'video_url': ideal_data['video_url']
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close_connection()

@letter_routes.route('/predict_and_compare', methods=['POST'])
@token_required
def predict_and_compare():
    db = Database()
    try:
        user_id = g.user_id
        system_letter = request.form['system_letter']
        letter_case = request.form['case'].lower()
        image_data = request.form['image']

        # Decode and process image
        image_data = image_data.replace("data:image/png;base64,", "")
        image_bytes = base64.b64decode(image_data)
        user_image = Image.open(BytesIO(image_bytes))

        # Prediction and validation
        predicted_letter = predict_letter(user_image)
        if not predicted_letter:
            return jsonify({'error': 'Prediction failed'}), 500

        # Get comparison data
        ideal_data = db.get_ideal_letter_url(system_letter, letter_case)
        if not ideal_data:
            return jsonify({'error': 'No ideal letter data found for the given letter and case'}), 404

        ideal_image_url = ideal_data['image_url']
        
        # Accuracy calculation
        response = requests.get(ideal_image_url)
        if response.status_code != 200:
            return jsonify({'error': 'Failed to retrieve ideal letter image'}), 500
            
        ideal_image = Image.open(BytesIO(response.content))
        accuracy = calculate_pixel_accuracy(user_image, ideal_image)
        status = 'correct' if predicted_letter.lower() == system_letter.lower() else 'incorrect'
        accuracy = 0.0 if status == 'incorrect' else accuracy

        # Save user submission
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_name = f"{timestamp}_{predicted_letter}.png"
        file_path = os.path.join(UPLOAD_FOLDER, file_name)
        user_image.save(file_path)

        # Save file_path as a URL-friendly path
        file_path_url = f"uploaded_letters/{file_name}"

        record = {
            "user_id": user_id,
            "predicted_letter": predicted_letter,
            "system_letter": system_letter,
            "case": letter_case,
            "file_path": file_path_url,
            "uploaded_at": timestamp,
            "accuracy": accuracy,
            "status": status
        }
        db.insert_data("letter_images", record)

        return jsonify({
            'predicted_letter': predicted_letter,
            'accuracy': accuracy,
            'ideal_image_url': ideal_image_url,
            'status': status
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close_connection()

@letter_routes.route('/get_user_written_letters', methods=['GET'])
@token_required
def get_user_written_letters():
    db = Database()
    try:
        user_id = g.user_id

        # Fetch user letters categorized by letter and case
        letter_data = db.get_user_letters(user_id)

        # Structure the response data
        response_data = {
            "user_id": user_id,
            "letters": letter_data
        }

        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close_connection()

@letter_routes.route('/predict_learning_curve', methods=['GET'])
@token_required
def predict_learning_curve():
    db = Database()
    try:
        user_id = g.user_id
        system_letter = request.args.get('system_letter')
        letter_case = request.args.get('case')

        if not system_letter or not letter_case:
            return jsonify({'error': 'Missing system_letter or case parameter'}), 400

        # Fetch historical accuracy data for the user and letter
        historical_data = db.get_user_letter_accuracy_history(user_id, system_letter, letter_case)

        if not historical_data:
            return jsonify({'error': 'No historical data found for this letter'}), 404

        # Filter out incorrect attempts and sort by timestamp
        filtered_data = [entry for entry in historical_data if entry['status'] == 'correct' and entry['accuracy'] > 0]
        filtered_data.sort(key=lambda x: x['uploaded_at'])

        if not filtered_data:
            return jsonify({'error': 'No valid historical data found for this letter'}), 404

        # Extract attempts and accuracy values
        attempts = list(range(1, len(filtered_data) + 1))
        accuracy = [entry['accuracy'] for entry in filtered_data]

        # Log the input data for debugging
        print(f"Attempts: {attempts}")
        print(f"Accuracy: {accuracy}")

        # Calculate average time per attempt
        timestamps = [datetime.strptime(entry['uploaded_at'], "%Y%m%d_%H%M%S") for entry in filtered_data]
        time_gaps = [(timestamps[i] - timestamps[i - 1]).total_seconds() / 86400 for i in range(1, len(timestamps))]
        avg_time_per_attempt = sum(time_gaps) / len(time_gaps) if time_gaps else 1.5  # Default to 1.5 days if no gaps

        # Log the average time per attempt for debugging
        print(f"Average time per attempt: {avg_time_per_attempt} days")

        # Predict attempts and time to reach 95% accuracy
        remaining_attempts, estimated_days, plot_path, explanation = predict_attempts_to_95(attempts, accuracy, avg_time_per_attempt, PLOT_FOLDER)

        if not plot_path:
            return jsonify({'error': 'Failed to generate learning curve plot'}), 500

        return jsonify({
            'system_letter': system_letter,
            'case': letter_case,
            'remaining_attempts': remaining_attempts,
            'estimated_days': estimated_days,
            'plot_url': f"/static/plots/learning_curve_plot.png",
            'explanation': explanation
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close_connection()

@letter_routes.route('/static/plots/<path:filename>')
def serve_plot(filename):
    return send_from_directory(PLOT_FOLDER, filename)