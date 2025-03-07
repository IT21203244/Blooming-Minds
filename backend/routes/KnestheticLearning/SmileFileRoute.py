from pymongo import MongoClient
from flask import Blueprint, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np
import os
from datetime import datetime
# MongoDB connection
client = MongoClient("mongodb+srv://blooming_minds:BsjsdM24@bloomingminds.n7ia1.mongodb.net/")
db = client["blooming_minds"]
smile_results_collection = db["smile_results"]

# Define the blueprint
SmileFileRoute = Blueprint('SmileFileRoute', __name__)

# Load the trained model
model_path = r"C:\Users\Dilshan\Desktop\Blooming-Minds\backend\routes\KnestheticLearning\smile_detection_model.h5"
model = load_model(model_path)

# Directory to save uploaded images temporarily
upload_folder = r"backend/routes/KnestheticLearning/uploads/"
os.makedirs(upload_folder, exist_ok=True)

def preprocess_image(image_path):
    img = load_img(image_path, target_size=(128, 128))
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0
    return img_array

@SmileFileRoute.route('/api/smile_check', methods=['POST'])
def smile_check():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_path = os.path.join(upload_folder, file.filename)
    file.save(file_path)

    try:
        img_array = preprocess_image(file_path)
        prediction = model.predict(img_array)
        smile_score = float(prediction[0][0] * 100)
        os.remove(file_path)
        return jsonify({'smile_percentage': smile_score})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@SmileFileRoute.route('/api/save_smile_data', methods=['POST'])
def save_smile_data():
    data = request.json
    username = data.get("username")
    smile_percentage = data.get("smile_percentage")

    if not username or smile_percentage is None:
        return jsonify({"error": "Username and Smile Percentage are required"}), 400

    # Get the current date and time
    current_datetime = datetime.now()
    current_date = current_datetime.date().strftime("%Y-%m-%d")  # Date in YYYY-MM-DD format
    current_time = current_datetime.time().strftime("%H:%M:%S")  # Time in HH:MM:SS format

    # Save data to MongoDB with date and time
    smile_results_collection.insert_one({
        "username": username,
        "smile_percentage": smile_percentage,
        "date": current_date,
        "time": current_time
    })

    return jsonify({'message': 'Data saved successfully'}), 200

@SmileFileRoute.route('/api/get_smile_data', methods=['GET'])
def get_smile_data():
    smile_data = list(smile_results_collection.find({}, {"_id": 0}))

    return jsonify(smile_data)
