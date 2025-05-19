import numpy as np

LEVELS = {"easy": 0, "medium": 1, "hard": 2}

def state_from_performance(performance):
    """
    Generate state vector from performance metrics.
    """
    level = LEVELS.get(performance["level"], 0)
    wrong_takes = performance["wrong_takes"]
    correct_takes = performance["correct_takes"]
    time_taken = performance["time_taken"]
    
    # Calculate additional metrics
    total_attempts = correct_takes + wrong_takes
    accuracy_percentage = (correct_takes / total_attempts) * 100 if total_attempts > 0 else 0
    average_time = 30  # Assume an average benchmark time (can be dynamic)
    time_efficiency = average_time / time_taken if time_taken > 0 else 1

    # Normalize values
    normalized_level = level / (len(LEVELS) - 1)  # Scale between 0 and 1
    normalized_wrong = wrong_takes / (wrong_takes + correct_takes + 1)  # Avoid division by zero
    normalized_correct = correct_takes / (wrong_takes + correct_takes + 1)
    normalized_time = min(time_taken / 60, 1)  # Cap at 60 seconds
    normalized_accuracy = accuracy_percentage / 100
    normalized_efficiency = min(time_efficiency, 2) / 2  # Cap at 2.0 and scale to 0-1

    # Construct state vector with normalized values
    return np.array([
        normalized_level,
        normalized_wrong,
        normalized_correct,
        normalized_time,
        normalized_accuracy,
        normalized_efficiency
    ])

def action_to_level(action, accuracy, efficiency):
    """
    Map action to game difficulty level with performance-based adjustments.
    """
    levels = ["easy", "medium", "hard"]
    
    # Default level based on action
    recommended_level = levels[action]
    
    # Adjust based on performance
    if accuracy >= 90 and efficiency >= 1.2:
        # If performing exceptionally well, consider moving up a level
        current_idx = levels.index(recommended_level)
        if current_idx < len(levels) - 1:
            recommended_level = levels[current_idx + 1]
    elif accuracy < 60 or efficiency < 0.8:
        # If struggling, consider moving down a level
        current_idx = levels.index(recommended_level)
        if current_idx > 0:
            recommended_level = levels[current_idx - 1]
    
    return recommended_level