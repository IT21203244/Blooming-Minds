import cv2
import mediapipe as mp
import numpy as np
import os
from io import BytesIO
from PIL import Image

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Initialize MediaPipe Hands
mpHands = mp.solutions.hands
hands = mpHands.Hands(static_image_mode=True, max_num_hands=2, 
                      min_detection_confidence=0.8, min_tracking_confidence=0.8)
mpDraw = mp.solutions.drawing_utils

# Define finger tip-base index for each finger
fingerCoordinates = [(8, 6), (12, 10), (16, 14), (20, 18)]  # Index, Middle, Ring, Little fingers
thumbCoordinate = (4, 2)  # Thumb tip and base

def detect_fingers_from_image(img: np.array):
    """
    Detect the number of fingers in the provided image data (numpy array).
    """
    if img is None:
        return {"error": "Invalid image data"}

    # Convert image to RGB (as MediaPipe requires RGB)
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Process the image with MediaPipe
    results = hands.process(imgRGB)

    totalFingerCount = 0  # Stores total fingers counted from both hands

    if results.multi_hand_landmarks:
        for idx, handLms in enumerate(results.multi_hand_landmarks):
            handPoints = []
            mpDraw.draw_landmarks(img, handLms, mpHands.HAND_CONNECTIONS)

            # Get hand landmark points in pixel coordinates
            h, w, c = img.shape
            for lm in handLms.landmark:
                cx, cy = int(lm.x * w), int(lm.y * h)
                handPoints.append((cx, cy))

            # Count raised fingers (compare Y-coordinates of landmarks)
            upCount = sum(handPoints[finger[0]][1] < handPoints[finger[1]][1] for finger in fingerCoordinates)

            # Thumb detection logic (for right and left hands)
            handedness = results.multi_handedness[idx].classification[0].label  # 'Left' or 'Right'
            if handedness == "Right":  
                if handPoints[thumbCoordinate[0]][0] > handPoints[thumbCoordinate[1]][0]:  
                    upCount += 1
            else:  
                if handPoints[thumbCoordinate[0]][0] < handPoints[thumbCoordinate[1]][0]:  
                    upCount += 1

            totalFingerCount += upCount  # Add this hand's count to the total

    # Return the total finger count
    return {"detected_finger_count": totalFingerCount}

