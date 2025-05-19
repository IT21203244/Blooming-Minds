def calculate_reward(performance):
    """
    Reward based on performance metrics.
    """
    accuracy_percentage = performance.get("accuracy_percentage", 0)
    time_efficiency = performance.get("time_efficiency", 1)
    streak = performance.get("streak", 0)

    base_reward = 0
    if accuracy_percentage >= 90 and time_efficiency >= 1.0:
        base_reward = 15  # High reward for exceptional performance
    elif 70 <= accuracy_percentage < 90:
        base_reward = 10  # Moderate reward for good performance
    elif 50 <= accuracy_percentage < 70:
        base_reward = 5  # Low reward for average performance
    else:
        base_reward = -5  # Penalty for poor performance

    # Add streak bonus
    streak_bonus = streak * 2  # Bonus points for streaks
    total_reward = base_reward + streak_bonus

    return total_reward


def determine_reward_type(streak, total_rewards_accumulated):
    """
    Determine the type of reward based on streaks and total rewards accumulated.
    """
    if streak >= 8:  # Trophy for 5 consecutive successes
        return "trophy"
    elif streak >= 5:  # Star for 3 consecutive successes
        return "star"
    elif total_rewards_accumulated >= 40:  # Trophy for 20 accumulated rewards
        return "trophy"
    elif total_rewards_accumulated >= 20:  # Star for 10 accumulated rewards
        return "star"
    else:  # Default to sticker
        return "sticker"