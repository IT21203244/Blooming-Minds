from flask import Blueprint, Response
import cv2
import tensorflow as tf
import numpy as np
import os

model_path = 'backend/routes/KnestheticLearning/smile_detection_model.h5'

if not os.path.exists(model_path):
    print(f"Model file not found: {model_path}")
    exit()

# Load the trained model
model = tf.keras.models.load_model(model_path)

# Initialize the webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not access the camera.")
    exit()

image_size = (128, 128)

predict_routes = Blueprint('predict_routes', __name__)

def gen():
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame.")
            break

        # Resize the frame to match the model input
        frame_resized = cv2.resize(frame, image_size)
        frame_resized = frame_resized / 255.0
        frame_resized = np.expand_dims(frame_resized, axis=0)

        prediction = model.predict(frame_resized)

        if prediction[0] > 0.5:
            label = "Smile"
            color = (0, 255, 0)  # Green
        else:
            label = "Not Smile"
            color = (0, 0, 255)  # Red

        cv2.putText(frame, label, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

        ret, jpeg = cv2.imencode('.jpg', frame)
        if not ret:
            print("Error: Could not encode frame.")
            continue

        frame = jpeg.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@predict_routes.route('/video_feed')
def video_feed():
    return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')

