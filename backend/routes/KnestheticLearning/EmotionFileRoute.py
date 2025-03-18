from pymongo import MongoClient
from flask import Blueprint, request, jsonify
import os
from datetime import datetime
from deepface import DeepFace
import cv2
import numpy as np

# MongoDB connection
client = MongoClient("mongodb+srv://blooming_minds:BsjsdM24@bloomingminds.n7ia1.mongodb.net/")
db = client["blooming_minds"]
emotion_results_collection = db["emotion_results"]

# Define the blueprint
EmotionFileRoute = Blueprint('EmotionFileRoute', __name__)

# Directory to save uploaded images temporarily
upload_folder = "backend/routes/KnestheticLearning/uploads/"
os.makedirs(upload_folder, exist_ok=True)

@EmotionFileRoute.route('/api/emotion_check', methods=['POST'])
def emotion_check():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_path = os.path.join(upload_folder, file.filename)
    file.save(file_path)

    try:
        # Analyze emotion using DeepFace
        result = DeepFace.analyze(img_path=file_path, actions=['emotion'])
        dominant_emotion = result[0]['dominant_emotion']
        os.remove(file_path)
        return jsonify({'dominant_emotion': dominant_emotion})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@EmotionFileRoute.route('/api/save_emotion_data', methods=['POST'])
def save_emotion_data():
    data = request.json
    username = data.get("username")
    dominant_emotion = data.get("dominant_emotion")

    if not username or not dominant_emotion:
        return jsonify({"error": "Username and Dominant Emotion are required"}), 400

    # Get the current date and time
    current_datetime = datetime.now()
    current_date = current_datetime.date().strftime("%Y-%m-%d")  # Date in YYYY-MM-DD format
    current_time = current_datetime.time().strftime("%H:%M:%S")  # Time in HH:MM:SS format

    # Save data to MongoDB with date and time
    emotion_results_collection.insert_one({
        "username": username,
        "dominant_emotion": dominant_emotion,
        "date": current_date,
        "time": current_time
    })

    return jsonify({'message': 'Data saved successfully'}), 200

@EmotionFileRoute.route('/api/get_emotion_data', methods=['GET'])
def get_emotion_data():
    emotion_data = list(emotion_results_collection.find({}, {"_id": 0}))
    return jsonify(emotion_data)