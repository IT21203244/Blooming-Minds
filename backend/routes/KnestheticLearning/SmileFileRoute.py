import os
import sqlite3
from flask import Blueprint, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np

# Define the blueprint
SmileFileRoute = Blueprint('SmileFileRoute', __name__)

# Load the trained model
model_path = r"C:\Users\Dilshan\Desktop\Blooming-Minds\backend\routes\KnestheticLearning\smile_detection_model.h5"
model = load_model(model_path)

# Directory to save uploaded images temporarily
upload_folder = r"backend/routes/KnestheticLearning/uploads/"
os.makedirs(upload_folder, exist_ok=True)

# Database setup
db_path = "smile_data.db"

def init_db():
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS smile_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                smile_percentage REAL NOT NULL
            )
        """)
        conn.commit()

init_db()

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

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO smile_results (username, smile_percentage) VALUES (?, ?)", (username, smile_percentage))
        conn.commit()

    return jsonify({'message': 'Data saved successfully'}), 201
@SmileFileRoute.route('/api/get_smile_data', methods=['GET'])
def get_smile_data():
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM smile_results")
        results = cursor.fetchall()

    smile_data = [{'id': row[0], 'username': row[1], 'smile_percentage': row[2]} for row in results]

    return jsonify(smile_data)
