from flask import Blueprint, jsonify, request
from utils.auth.token_auth import token_required
from utils.VisualLearning.db_util import get_user_finger_counting_sessions
import logging
import math
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

fprogress_tracking_routes = Blueprint("fprogress_tracking_routes", __name__)

def calculate_cognitive_load(session):
    """Calculate cognitive load based on accuracy, time, and attempts"""
    accuracy = sum(1 for result in session['number_data'] if result['status'][-1] == 'Correct') / len(session['number_data'])
    avg_time = sum(sum(result['time_taken']) / len(result['time_taken']) for result in session['number_data']) / len(session['number_data'])
    total_attempts = sum(result['attempt_count_per_number'] for result in session['number_data'])
    
    # Cognitive load formula (can be adjusted based on requirements)
    cognitive_load = (1 - accuracy) * 0.5 + (avg_time / 30) * 0.3 + (total_attempts / len(session['number_data'])) * 0.2
    return round(cognitive_load * 100, 2)  # Scale to 0-100

def predict_future_performance(data, feature, days_to_predict=7):
    """Predict future performance using Linear Regression"""
    # Parse date strings, handling both date and time
    dates = np.array([(datetime.strptime(d['date'].split(' ')[0], '%Y-%m-%d') - datetime(1970, 1, 1)).days for d in data]).reshape(-1, 1)
    values = np.array([d[feature] for d in data])
    
    model = LinearRegression()
    model.fit(dates, values)
    
    future_dates = np.array([(datetime.now() + timedelta(days=i) - datetime(1970, 1, 1)).days for i in range(1, days_to_predict + 1)]).reshape(-1, 1)
    predictions = model.predict(future_dates)
    
    return predictions.tolist()

@fprogress_tracking_routes.route('/get_user_progress', methods=['GET'])
@token_required
def get_user_progress():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        sessions = get_user_finger_counting_sessions(user_id)
        
        # Process data for visualization
        progress_data = []
        for session in sessions:
            accuracy = sum(1 for result in session['number_data'] if result['status'][-1] == 'Correct') / len(session['number_data'])
            avg_time = sum(sum(result['time_taken']) / len(result['time_taken']) for result in session['number_data']) / len(session['number_data'])
            cognitive_load = calculate_cognitive_load(session)
            
            progress_data.append({
                'date': session['date'],
                'accuracy': round(accuracy * 100, 2),
                'average_time': round(avg_time, 2),
                'cognitive_load': cognitive_load,
                'level': session['level']
            })
        
        # Predict future performance
        future_accuracy = predict_future_performance(progress_data, 'accuracy')
        future_avg_time = predict_future_performance(progress_data, 'average_time')
        future_cognitive_load = predict_future_performance(progress_data, 'cognitive_load')
        
        return jsonify({
            'progress_data': progress_data,
            'future_accuracy': future_accuracy,
            'future_avg_time': future_avg_time,
            'future_cognitive_load': future_cognitive_load
        })
    
    except Exception as e:
        logging.error(f"Error in get_user_progress: {str(e)}")
        return jsonify({"error": str(e)}), 500