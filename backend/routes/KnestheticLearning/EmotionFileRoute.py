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

EmotionFileRoute = Blueprint('EmotionFileRoute', __name__)

# Directory to save uploaded images temporarily
upload_folder = "backend/routes/KnestheticLearning/uploads/"
os.makedirs(upload_folder, exist_ok=True)

#Model Path
model_path = r'C:\Users\Dilshan\Desktop\Blooming-Minds\backend\routes\KnestheticLearning\Emotion_detection_model.h5'

@EmotionFileRoute.route('/api/emotion_check', methods=['POST'])
def emotion_check():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_path = os.path.join(upload_folder, file.filename)
    file.save(file_path)

    try:
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
    taskname = data.get("taskname")  
    result = data.get("result")  
    status = data.get("status")  
    # Validate required fields
    if not username or not taskname or not result or not status:
        return jsonify({"error": "Username, Taskname, Result, and Status are required"}), 400

    # Get the current date and time
    current_datetime = datetime.now()
    current_date = current_datetime.date().strftime("%Y-%m-%d")  
    current_time = current_datetime.time().strftime("%H:%M:%S")  

    # Save data to MongoDB
    emotion_results_collection.insert_one({
        "username": username,
        "taskname": taskname, 
        "result": result, 
        "status": status, 
        "date": current_date,
        "time": current_time
    })

    return jsonify({'message': 'Data saved successfully'}), 200

@EmotionFileRoute.route('/api/get_emotion_data', methods=['GET'])
def get_emotion_data():
    emotion_data = list(emotion_results_collection.find({}, {"_id": 0}))
    return jsonify(emotion_data)