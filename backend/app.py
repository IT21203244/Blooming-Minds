# from flask import Flask
# from flask_cors import CORS
# import logging
# from routes.AuditoryLearning.record_routes import record_routes

# # Flask app setup
# app = Flask(__name__)
# CORS(app)  # Allow cross-origin requests

# # Configure logging for better debugging
# logging.basicConfig(level=logging.DEBUG)

# # Register Blueprints
# app.register_blueprint(record_routes)

# if __name__ == "__main__":
#     app.run(port=5000)
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import tensorflow as tf
import base64
from io import BytesIO
import cv2

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)  # This will allow requests from any domain

# Load the trained model
model = tf.keras.models.load_model('../models/saved_models/Kinesthetic/smile_detection_model.h5')

# Set the image size for the model (resize frames from the webcam)
image_size = (128, 128)

# Helper function for image decoding
def decode_image(data):
    try:
        # Remove the prefix (e.g., 'data:image/png;base64,') if it exists
        if data.startswith('data:image'):
            data = data.split(',')[1]

        img_data = base64.b64decode(data)
        img = Image.open(BytesIO(img_data))
        return np.array(img)
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

# Function to predict smile
def predict_smile(frame):
    frame_resized = cv2.resize(frame, image_size)
    frame_resized = frame_resized / 255.0  # Normalize pixel values
    frame_resized = np.expand_dims(frame_resized, axis=0)  # Add batch dimension
    
    # Make prediction
    prediction = model.predict(frame_resized)
    
    if prediction[0] > 0.5:
        return "Smile", (0, 255, 0)  # Green for smile
    else:
        return "Not Smile", (0, 0, 255)  # Red for not smile

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get image data from the request
        data = request.get_json()
        image_data = data['image']

        # Decode the image data
        img = decode_image(image_data)
        if img is None:
            return jsonify({'error': 'Invalid image data'}), 400

        # Get the smile prediction
        label, color = predict_smile(img)
        return jsonify({'result': label})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
