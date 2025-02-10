from flask import Blueprint, jsonify, request, g
from PIL import Image
from io import BytesIO
import base64
import os
from datetime import datetime
from utils.ReadWriteLearning.ml_utils import predict_letter, calculate_pixel_accuracy
from utils.ReadWriteLearning.db_util import Database
from utils.auth.token_auth import token_required

letter_routes = Blueprint('letter_routes', __name__)

UPLOAD_FOLDER = "E:/BloomingMinds/backend/uploaded_letters"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@letter_routes.route('/predict_and_compare', methods=['POST'])
@token_required
def predict_and_compare():
    db = Database()
    try:
        user_id = g.user_id

        if 'image' not in request.form or 'system_letter' not in request.form:
            return jsonify({'error': 'No image or system letter provided'}), 400

        system_letter = request.form['system_letter']
        image_data = request.form['image']

        # Decode the Base64 image data
        image_data = image_data.replace("data:image/png;base64,", "")
        image_bytes = base64.b64decode(image_data)
        user_image = Image.open(BytesIO(image_bytes))

        predicted_letter = predict_letter(user_image)
        if not predicted_letter:
            return jsonify({'error': 'Prediction failed'}), 500

        ideal_letter_blob = db.get_ideal_letter(system_letter)
        if not ideal_letter_blob:
            return jsonify({'error': 'Ideal letter not found'}), 404

        ideal_letter_bytes = base64.b64decode(ideal_letter_blob)
        ideal_image = Image.open(BytesIO(ideal_letter_bytes))

        accuracy = calculate_pixel_accuracy(user_image, ideal_image)
        status = 'correct' if predicted_letter.lower() == system_letter.lower() else 'incorrect'

        if status == 'incorrect':
            accuracy = 0.0

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_name = f"{timestamp}_{predicted_letter}.png"
        file_path = os.path.join(UPLOAD_FOLDER, file_name)
        user_image.save(file_path)

        ideal_image_buffer = BytesIO()
        ideal_image.save(ideal_image_buffer, format="PNG")
        ideal_image_base64 = base64.b64encode(ideal_image_buffer.getvalue()).decode('utf-8')

        record = {
            "user_id": user_id,
            "predicted_letter": predicted_letter,
            "system_letter": system_letter,
            "file_path": file_path,
            "uploaded_at": timestamp,
            "accuracy": accuracy,
            "status": status
        }

        inserted_id = db.insert_data("letter_images", record)

        return jsonify({
            'predicted_letter': predicted_letter,
            'accuracy': accuracy,
            'ideal_image': ideal_image_base64,
            'status': status
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close_connection()
