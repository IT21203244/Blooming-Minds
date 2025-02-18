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

    # Normalize values and construct state vector
    return np.array([level, wrong_takes, correct_takes, time_taken, accuracy_percentage, time_efficiency]).reshape(1, -1)

def action_to_level(action):
    """
    Map action to game difficulty level.
    """
    actions = ["easy", "medium", "hard"]
    return actions[action]
