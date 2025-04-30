import logging
import os
import io
import matplotlib
matplotlib.use('Agg')  # Use the 'Agg' backend for non-interactive plotting
import matplotlib.pyplot as plt
import pandas as pd
from utils.auth.token_auth import token_required
from flask import Blueprint, request, jsonify, g, send_file
from utils.VisualLearning.db_util import get_color_matching_results
from datetime import datetime

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

progress_visualization_routes = Blueprint("progress_visualization_routes", __name__)

# Utility function to generate a bar chart for accuracy
def generate_accuracy_chart(df, title="Accuracy Chart", xlabel="Date", ylabel="Accuracy"):
    try:
        fig, ax = plt.subplots(figsize=(10, 6))

        # Format the x-axis labels to show "Month Day (Level)"
        x_labels = [
            f"{datetime.strptime(str(date), '%Y-%m-%d %H:%M:%S.%f%z').strftime('%b %d')} ({level})"
            for date, level in zip(df['date'], df['level'])
        ]
        
        ax.bar(x_labels, df['accuracy'], color='blue', label='Accuracy')
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        ax.set_title(title)
        ax.legend()

        # Rotate x-axis labels for better visibility
        plt.xticks(rotation=45)
        
        # Save the chart to a bytes buffer
        img_io = io.BytesIO()
        plt.tight_layout()
        plt.savefig(img_io, format='png')
        img_io.seek(0)

        plt.close(fig)

        return img_io
    except Exception as e:
        logger.error(f"Error generating accuracy chart: {str(e)}")
        return None

# Utility function to generate a bar chart for time efficiency
def generate_time_efficiency_chart(df, title="Time Efficiency Chart", xlabel="Date", ylabel="Time Efficiency"):
    try:
        fig, ax = plt.subplots(figsize=(10, 6))

        # Modify the date parsing to handle the ISO 8601 format (date and time)
        x_labels = [
            f"{datetime.strptime(str(date), '%Y-%m-%d %H:%M:%S.%f%z').strftime('%b %d')} ({level})"
            for date, level in zip(df['date'], df['level'])
        ]

        ax.bar(x_labels, df['time_efficiency'], color='green', label='Time Efficiency')
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        ax.set_title(title)
        ax.legend()

        # Rotate x-axis labels for better visibility
        plt.xticks(rotation=45)

        # Save the chart to a bytes buffer
        img_io = io.BytesIO()
        plt.tight_layout()
        plt.savefig(img_io, format='png')
        img_io.seek(0)

        plt.close(fig)

        return img_io
    except Exception as e:
        logger.error(f"Error generating time efficiency chart: {str(e)}")
        return None

# Function to generate Learning Summary
def generate_learning_summary(df):
    """
    Generate the learning summary with performance metrics and feedback.
    """
    summary = {}

    # Performance Metrics
    total_accuracy = df['accuracy'].mean()
    total_time_efficiency = df['time_efficiency'].mean()

    # Feedback based on performance
    if total_accuracy >= 90:
        summary['accuracy_feedback'] = "Excellent! Your accuracy is outstanding."
    elif 70 <= total_accuracy < 90:
        summary['accuracy_feedback'] = "Good job! Keep up the good work, but there's room for improvement."
    elif 50 <= total_accuracy < 70:
        summary['accuracy_feedback'] = "Fair performance, but try to focus on improving accuracy."
    else:
        summary['accuracy_feedback'] = "Needs improvement. Consider revisiting the basics to enhance your accuracy."

    if total_time_efficiency >= 1.0:
        summary['time_efficiency_feedback'] = "Great! You're using your time efficiently."
    else:
        summary['time_efficiency_feedback'] = "Your time efficiency could be improved. Try to complete tasks more swiftly."

    # Recommended Levels based on performance
    last_level = df['level'].iloc[-1]  # Get the most recent level

    if total_accuracy >= 90 and last_level == "hard":
        summary['recommended_level'] = "You're performing excellently! Continue with the 'hard' level."
    elif total_accuracy >= 70:
        summary['recommended_level'] = "You're doing well. Try advancing to the 'medium' level."
    else:
        summary['recommended_level'] = "Focus on improving. Stick to the 'easy' level to build confidence."

    return summary


@progress_visualization_routes.route('/child_progress', methods=['GET'])
@token_required
def child_progress():
    try:
        user_id = g.user_id  # Get the logged-in user ID
        results = get_color_matching_results(user_id=user_id)  # Retrieve results from DB

        if not results:
            return jsonify({"error": "No results found for the user."}), 404

        # Convert results into a pandas DataFrame
        data = []
        for result in results:
            data.append({
                "date": result.get("date"),  # Assuming `date` is part of the result
                "level": result.get("level"),
                "accuracy": result.get("accuracy"),
                "time_efficiency": result.get("time_efficiency"),
            })

        df = pd.DataFrame(data)

        # Check for missing values and fill them with default values if necessary
        df['accuracy'] = df['accuracy'].fillna(0)
        df['time_efficiency'] = df['time_efficiency'].fillna(0)

        # Sort data by date to ensure chronological order
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df.sort_values(by='date', inplace=True)

        if df.empty:
            return jsonify({"error": "No data available for visualization."}), 404

        # Generate the accuracy chart
        accuracy_chart_io = generate_accuracy_chart(df, title="Child's Accuracy Progress", xlabel="Date", ylabel="Accuracy")

        if accuracy_chart_io is None:
            return jsonify({"error": "Error generating accuracy chart."}), 500

        # Generate the time efficiency chart
        time_efficiency_chart_io = generate_time_efficiency_chart(df, title="Child's Time Efficiency Progress", xlabel="Date", ylabel="Time Efficiency")

        if time_efficiency_chart_io is None:
            return jsonify({"error": "Error generating time efficiency chart."}), 500

        # Generate the Learning Summary
        learning_summary = generate_learning_summary(df)

        # Return both charts as a ZIP file containing the two images and the learning summary
        from io import BytesIO
        from zipfile import ZipFile

        zip_io = BytesIO()
        with ZipFile(zip_io, 'w') as zip_file:
            zip_file.writestr("accuracy_chart.png", accuracy_chart_io.getvalue())
            zip_file.writestr("time_efficiency_chart.png", time_efficiency_chart_io.getvalue())
            zip_file.writestr("learning_summary.txt", f"Learning Summary:\n\n{learning_summary}")

        zip_io.seek(0)

        return send_file(zip_io, mimetype='application/zip', as_attachment=True, download_name="child_progress_charts.zip")

    except Exception as e:
        logger.error(f"Error fetching or generating progress: {str(e)}")
        return jsonify({"error": str(e)}), 500
