from flask import Blueprint, request, jsonify
import logging
import numpy as np
import tensorflow as tf
from PIL import Image
from io import BytesIO
import base64
import cv2
import os

# Initialize the Blueprint for predict routes
predict_routes = Blueprint('predict_routes', __name__)

# Load the trained model
model_path = os.path.join(os.path.dirname(__file__), '../../../models/saved_models/Kinesthetic/smile_detection_model.h5')
model = tf.keras.models.load_model(model_path)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Route for handling smile detection requests
@predict_routes.route('/predict', methods=['POST'])
def predict():
    data = request.json
    img_data = data['image']

    # Decode the base64 image
    img_data = base64.b64decode(img_data)
    img = Image.open(BytesIO(img_data))
    img = np.array(img)

    # Preprocess the image (resize and normalize)
    img_resized = cv2.resize(img, (128, 128))
    img_resized = img_resized / 255.0
    img_resized = np.expand_dims(img_resized, axis=0)

    # Make prediction
    prediction = model.predict(img_resized)

    if prediction[0] > 0.5:
        result = "Smile"
    else:
        result = "Not Smile"
    
    return jsonify({'prediction': result})
