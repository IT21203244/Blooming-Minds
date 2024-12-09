from flask import Blueprint, request, jsonify
from utils.VisualLearning.db_util import insert_color_matching_result, get_color_matching_results, analyze_color_matching_trends, plot_accuracy_vs_time, plot_avg_time_per_level, plot_error_frequency

color_matching_routes = Blueprint("color_matching_routes", __name__)

@color_matching_routes.route('/color_matching_game', methods=['POST'])
def color_matching_game():
    try:
        # Get JSON data from the request
        data = request.json

        # Extract required fields
        user_id = data.get("user_id")
        level = data.get("level")
        wrong_takes = data.get("wrong_takes")
        correct_takes = data.get("correct_takes")
        total_score = data.get("total_score")
        time_taken = data.get("time_taken")
        provided_sequence = data.get("provided_sequence")
        child_sequence = data.get("child_sequence")
        date = data.get("date")

        # Validation
        if not all([user_id, level, wrong_takes, correct_takes, total_score, time_taken, provided_sequence, child_sequence, date]):
            return jsonify({"error": "All fields are required."}), 400

        # Insert into database
        result_id = insert_color_matching_result(
            user_id=user_id,
            level=level,
            wrong_takes=wrong_takes,
            correct_takes=correct_takes,
            total_score=total_score,
            time_taken=time_taken,
            provided_sequence=provided_sequence,
            child_sequence=child_sequence,
            date=date
        )

        return jsonify({"message": "Result saved successfully.", "result_id": result_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@color_matching_routes.route('/color_matching_game', methods=['GET'])
def fetch_color_matching_results():
    """
    Fetches all color matching game results or filtered by user_id.
    """
    try:
        # Optional query parameter to filter by user_id
        user_id = request.args.get("user_id")

        # Fetch data from the database
        results = get_color_matching_results(user_id=user_id)

        return jsonify({"results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@color_matching_routes.route('/generate_report', methods=['GET'])
def generate_report():
    try:
        # Get user_id and date range from query parameters (optional)
        user_id = request.args.get('user_id')
        start_date = request.args.get('start_date')  # Format: YYYY-MM-DD
        end_date = request.args.get('end_date')  # Format: YYYY-MM-DD

        # Analyze trends
        df = analyze_color_matching_trends(user_id, start_date, end_date)
        
        # Plot trends
        plot_accuracy_vs_time(df)
        plot_avg_time_per_level(df)
        plot_error_frequency(df)

        # Generate report insights
        insights = []
        avg_accuracy = df['accuracy'].mean()
        if avg_accuracy > 75:
            insights.append("Good accuracy overall!")
        else:
            insights.append("Accuracy could be improved, consider practicing more on higher levels.")

        avg_error_freq = df['error_frequency'].mean()
        if avg_error_freq < 10:
            insights.append("Low error frequency across all levels.")
        else:
            insights.append("Struggling with errors, try revising lower levels.")

        # Return the insights along with report images
        return jsonify({
            "message": "Report generated successfully.",
            "insights": insights,
            "accuracy_vs_time_image": "accuracy_vs_time.png",
            "avg_time_per_level_image": "avg_time_per_level.png",
            "error_frequency_image": "error_frequency.png"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
