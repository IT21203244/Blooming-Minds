import cv2
import numpy as np
import tensorflow as tf

# Load the trained model
model = tf.keras.models.load_model('../../saved_models/Kinesthetic/smile_detection_model.h5')

# Initialize the webcam
cap = cv2.VideoCapture(0)  # 0 means the default webcam

# Check if the webcam is opened correctly
if not cap.isOpened():
    print("Error: Could not access the camera.")
    exit()

# Set the image size for processing (same size as model input)
image_size = (128, 128)

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()

    if not ret:
        print("Error: Failed to capture image.")
        break

    # Resize the frame to match the input size of the model
    frame_resized = cv2.resize(frame, image_size)

    # Normalize the frame
    frame_resized = frame_resized / 255.0  # Normalize pixel values
    frame_resized = np.expand_dims(frame_resized, axis=0)  # Add batch dimension

    # Make predictions
    prediction = model.predict(frame_resized)
    
    # If the model predicts "smiling"
    if prediction[0] > 0.5:
        label = "Smile"
        color = (0, 255, 0)  # Green for smile
    else:
        label = "Not Smile"
        color = (0, 0, 255)  # Red for not smile

    # Display the label on the frame
    cv2.putText(frame, label, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

    # Show the resulting frame
    cv2.imshow('Smile Detection', frame)

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the camera and close all OpenCV windows
cap.release()
cv2.destroyAllWindows()
