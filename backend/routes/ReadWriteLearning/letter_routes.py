from flask import Blueprint, jsonify, request
import os
import random
from datetime import datetime
from PIL import Image
from io import BytesIO
import base64
from utils.ReadWriteLearning.ml_utils import predict_letter, calculate_pixel_accuracy
from utils.ReadWriteLearning.db_util import Database

# Define the Blueprint for ReadWriteLearning
letter_routes = Blueprint('letter_routes', __name__)

# Directory to store uploaded images
UPLOAD_FOLDER = "E:/BloomingMinds/backend/uploaded_letters"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the folder exists

# Simulated user IDs (for now, we assume random IDs for 3 users)
USER_IDS = [101, 102, 103]

# Route for predicting the letter from an image and generating a system letter
@letter_routes.route('/predict_and_compare', methods=['POST'])
def predict_and_compare():
    db = Database()  # Initialize the database connection
    try:
        # Simulate user ID selection
        user_id = random.choice(USER_IDS)

        if 'image' not in request.files or 'system_letter' not in request.form:
            return jsonify({'error': 'No image or system letter provided'}), 400

        # Get the system letter from the form data
        system_letter = request.form['system_letter']
        print(f"Received system_letter: {system_letter}")  # Debug line to check system letter

        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Open the image file
        user_image = Image.open(image_file)

        # Predict the letter
        predicted_letter = predict_letter(user_image)
        if not predicted_letter:
            return jsonify({'error': 'Prediction failed'}), 500

        # Check if predicted letter is uppercase or lowercase
        is_uppercase = predicted_letter.isupper()

        # Fetch the ideal letter image from the database (stored as image_blob)
        ideal_letter_blob = db.get_ideal_letter(system_letter)

        if not ideal_letter_blob:
            return jsonify({'error': 'Ideal letter image not found'}), 404

        # Decode the base64 image blob to bytes
        ideal_letter_bytes = base64.b64decode(ideal_letter_blob)

        # Open the ideal letter as a PIL image
        ideal_image = Image.open(BytesIO(ideal_letter_bytes))

        # Compare the user image with the ideal image
        accuracy = calculate_pixel_accuracy(user_image, ideal_image)

        # Determine whether the predicted letter matches the system letter
        status = 'correct' if predicted_letter.strip().lower() == system_letter.strip().lower() else 'incorrect'

        # If the status is incorrect, set accuracy to 0%
        if status == 'incorrect':
            accuracy = 0.0

        # Save the user image with metadata
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_name = f"{timestamp}_{predicted_letter}.png"
        file_path = os.path.join(UPLOAD_FOLDER, file_name)
        user_image.save(file_path)

        # Encode the ideal letter image to base64 for returning to the frontend
        ideal_image_buffer = BytesIO()
        ideal_image.save(ideal_image_buffer, format="PNG")
        ideal_image_base64 = base64.b64encode(ideal_image_buffer.getvalue()).decode('utf-8')

        # Record metadata with simulated user ID and the generated system letter
        record = {
            "user_id": user_id,
            "predicted_letter": predicted_letter,
            "system_letter": system_letter,  # Store the system letter
            "file_path": file_path,
            "uploaded_at": timestamp,
            "accuracy": accuracy,
            "status": status,  # Store the correctness status
            "is_uppercase": is_uppercase  # Store whether the predicted letter is uppercase
        }

        # Debugging the record before insertion
        print(f"Inserting record: {record}")

        # Insert record into database
        inserted_id = db.insert_data("letter_images", record)

        return jsonify({
            'message': 'Prediction and comparison successful',
            'user_id': user_id,
            'predicted_letter': predicted_letter,
            'system_letter': system_letter,  # Return the generated system letter
            'accuracy': accuracy,
            'file_id': inserted_id,
            'file_path': file_path,
            'ideal_image': ideal_image_base64,  # Base64-encoded ideal letter image
            'status': status,  # Return the status of the prediction
            'is_uppercase': is_uppercase  # Send if the predicted letter is uppercase
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close_connection()

@letter_routes.route('/get_user_letters/<int:user_id>', methods=['GET'])
def get_user_letters(user_id):
    db = Database()  # Initialize the database connection
    try:
        # Fetch user letters from the database
        user_letters = db.get_user_letters(user_id)
        
        if not user_letters:
            return jsonify({'error': 'No letter records found for this user'}), 404

        # Create a response with user letters details
        user_letters_details = []
        for letter in user_letters:
            user_letters_details.append({
                "user_id": letter.get("user_id"),
                "predicted_letter": letter.get("predicted_letter"),
                "system_letter": letter.get("system_letter"),
                "file_path": letter.get("file_path"),
                "uploaded_at": letter.get("uploaded_at"),
                "accuracy": letter.get("accuracy"),
                "status": letter.get("status"),
                "is_uppercase": letter.get("is_uppercase"),
            })

        return jsonify({'user_letters': user_letters_details}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close_connection()

# Route for getting user letter details
@letter_routes.route('/get_user_letter_details/<int:user_id>/<letter>', methods=['GET'])
def get_user_letter_details(user_id, letter):
    db = Database()  # Initialize the database connection
    try:
        # Fetch user letters for the specified letter from the database
        user_letter = db.get_user_letter_by_letter(user_id, letter)

        if not user_letter:
            return jsonify({'error': 'No letter record found for this user and letter'}), 404

        # Prepare the details for the response
        letter_details = {
            "user_id": user_letter.get("user_id"),
            "predicted_letter": user_letter.get("predicted_letter"),
            "system_letter": user_letter.get("system_letter"),
            "file_path": user_letter.get("file_path"),
            "uploaded_at": user_letter.get("uploaded_at"),
            "accuracy": user_letter.get("accuracy"),
            "status": user_letter.get("status"),
            "is_uppercase": user_letter.get("is_uppercase"),
            "ideal_letter_url": user_letter.get("ideal_letter_url"),  # URL or base64-encoded string
        }

        return jsonify({'letter_details': letter_details}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close_connection()