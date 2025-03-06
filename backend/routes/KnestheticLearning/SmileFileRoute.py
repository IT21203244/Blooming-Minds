import os
from flask import Blueprint, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np

# Define the blueprint
SmileFileRoute = Blueprint('SmileFileRoute', __name__)

# Path to the trained model
model_path = r"C:\Users\Dilshan\Desktop\Blooming-Minds\backend\routes\KnestheticLearning\smile_detection_model.h5"
model = load_model(model_path)

# Directory to save uploaded images temporarily
upload_folder = r"backend/routes/KnestheticLearning/uploads/"
os.makedirs(upload_folder, exist_ok=True)

def preprocess_image(image_path):
    img = load_img(image_path, target_size=(128, 128))  # Change to 128x128
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    return img_array


@SmileFileRoute.route('/api/smile_check', methods=['POST'])
def smile_check():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    file_path = os.path.join(upload_folder, file.filename)
    file.save(file_path)
    
    try:
        img_array = preprocess_image(file_path)
        prediction = model.predict(img_array)
        smile_score = float(prediction[0][0] * 100)  # Convert to percentage and ensure it's a Python float
        os.remove(file_path)  # Clean up after prediction
        return jsonify({'smile_percentage': smile_score})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

