import cv2
import mediapipe as mp
import numpy as np
from flask import Blueprint, jsonify, request
import base64
from datetime import datetime
from utils.auth.token_auth import token_required
from utils.VisualLearning.db_util import insert_finger_counting_session, get_finger_counting_session
import logging

# Initialize MediaPipe Hands and Face Mesh
mp_hands = mp.solutions.hands
mp_face_mesh = mp.solutions.face_mesh

hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=2,
    min_detection_confidence=0.75,
    min_tracking_confidence=0.75
)

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

hand_detection_routes = Blueprint("hand_detection_routes", __name__)

# Configuration for finger detection
FINGER_JOINTS = {
    'thumb': {'tip': 4, 'base': 2},
    'index': {'tip': 8, 'base': 6},
    'middle': {'tip': 12, 'base': 10},
    'ring': {'tip': 16, 'base': 14},
    'pinky': {'tip': 20, 'base': 18}
}
FINGER_THRESHOLD = 0.07  # 7% of image height as activation threshold

def count_fingers(image):
    """Enhanced finger counting with zero detection improvements"""
    try:
        results = hands.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        total_count = 0

        if results.multi_hand_landmarks and results.multi_handedness:
            for hand_landmarks, handedness in zip(results.multi_hand_landmarks,
                                                  results.multi_handedness):
                # Convert landmarks to pixel coordinates
                h, w, _ = image.shape
                threshold_px = int(h * FINGER_THRESHOLD)
                landmarks = [(lm.x * w, lm.y * h) for lm in hand_landmarks.landmark]

                # Initialize counters
                finger_count = 0
                
                # Check regular fingers (index, middle, ring, pinky)
                for finger in ['index', 'middle', 'ring', 'pinky']:
                    tip = int(FINGER_JOINTS[finger]['tip'])
                    base = int(FINGER_JOINTS[finger]['base'])
                    
                    # Finger is considered raised if tip is significantly above base
                    if landmarks[tip][1] < (landmarks[base][1] - threshold_px):
                        finger_count += 1

                # Thumb detection with dual-axis check
                hand_type = handedness.classification[0].label
                thumb_tip = FINGER_JOINTS['thumb']['tip']
                thumb_base = FINGER_JOINTS['thumb']['base']
                
                # Check both X position and Y position for thumb
                if hand_type == "Right":
                    thumb_raised = (landmarks[thumb_tip][0] > landmarks[thumb_base][0] and  # X-axis
                                    landmarks[thumb_tip][1] < (landmarks[thumb_base][1] - threshold_px))  # Y-axis
                else:  # Left hand
                    thumb_raised = (landmarks[thumb_tip][0] < landmarks[thumb_base][0] and  # X-axis
                                    landmarks[thumb_tip][1] < (landmarks[thumb_base][1] - threshold_px))  # Y-axis
                
                if thumb_raised:
                    finger_count += 1

                total_count += finger_count

        return total_count

    except Exception as e:
        logging.error(f"Error in count_fingers: {str(e)}")
        return 0  # Return 0 if there's an error

def detect_emotion(image):
    """Detect emotion using MediaPipe Face Mesh"""
    try:
        # Convert image to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(image_rgb)

        if results.multi_face_landmarks:
            # For simplicity, we assume a neutral face if landmarks are detected
            return {"neutral": 1.0}
        else:
            return {"neutral": 0.0}  # No face detected
    except Exception as e:
        logging.error(f"Error in detect_emotion: {str(e)}")
        return {}

def get_motivational_feedback(emotions):
    """Provide motivational feedback based on detected emotions"""
    if emotions.get("neutral", 0) == 1.0:
        return "Great job! Keep going!"
    else:
        return "Make sure your face is visible for better feedback!"

@hand_detection_routes.route('/submit_finger_count_session', methods=['POST'])
@token_required
def submit_finger_count_session():
    try:
        data = request.json
        user_id = data.get('user_id')
        number_data = data.get('number_data')
        total_attempt_count = data.get('total_attempt_count')
        level = data.get('level')
        badges = data.get('badges', [])

        if not all([user_id, number_data, total_attempt_count, level]):
            return jsonify({"error": "Missing required fields"}), 400

        # Save to database
        result_id = insert_finger_counting_session(
            user_id=user_id,
            number_data=number_data,
            total_attempt_count=total_attempt_count,
            date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            level=level,
            badges=badges
        )

        return jsonify({
            "message": "Finger count session saved successfully",
            "result_id": result_id
        })

    except Exception as e:
        logging.error(f"Error in submit_finger_count_session: {str(e)}")
        return jsonify({"error": str(e)}), 500

@hand_detection_routes.route('/count_fingers', methods=['POST'])
@token_required
def count_fingers_api():
    try:
        data = request.json
        image_data = data.get('image')

        if not image_data:
            return jsonify({"error": "Missing image data"}), 400

        # Decode base64 image
        _, encoded = image_data.split(",", 1)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Count fingers using the existing logic
        finger_count = count_fingers(image)

        # Detect emotion
        emotions = detect_emotion(image)

        # Get motivational feedback
        feedback = get_motivational_feedback(emotions)

        return jsonify({
            "finger_count": finger_count,
            "emotions": emotions,
            "feedback": feedback  # Include motivational feedback in the response
        })

    except Exception as e:
        logging.error(f"Error in count_fingers_api: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@hand_detection_routes.route('/get_finger_count_session/<result_id>', methods=['GET'])
@token_required
def get_finger_count_session(result_id):
    try:
        result = get_finger_counting_session(result_id)
        if result:
            return jsonify(result)
        else:
            return jsonify({"error": "Result not found"}), 404
    except Exception as e:
        logging.error(f"Error in get_finger_count_session: {str(e)}")
        return jsonify({"error": str(e)}), 500