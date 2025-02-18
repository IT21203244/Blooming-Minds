def calculate_reward(performance):
    """
    Reward based on performance metrics.
    """
    accuracy_percentage = performance.get("accuracy_percentage", 0)
    time_efficiency = performance.get("time_efficiency", 1)

    if accuracy_percentage >= 90 and time_efficiency >= 1.0:
        return 15  # High reward for exceptional performance
    elif 70 <= accuracy_percentage < 90:
        return 10  # Moderate reward for good performance
    elif 50 <= accuracy_percentage < 70:
        return 5  # Low reward for average performance
    else:
        return -5  # Penalty for poor performance
