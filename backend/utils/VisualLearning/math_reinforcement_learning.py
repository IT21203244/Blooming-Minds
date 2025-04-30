from utils.VisualLearning.db_util import get_user_level, update_user_level

def adjust_difficulty(user_id, concept, current_level, is_correct):
    """Adjust difficulty dynamically based on correctness for each math concept."""
    levels = ["Easy", "Medium", "Hard"]

    # Ensure current_level is valid
    if current_level not in levels:
        current_level = "Easy"  # Default to easy if current_level is invalid

    if is_correct and current_level != "Hard":
        new_level = levels[levels.index(current_level) + 1]  # Increase difficulty
    elif not is_correct and current_level != "Easy":
        new_level = levels[levels.index(current_level) - 1]  # Decrease difficulty
    else:
        new_level = current_level

    # Update user-specific level for this concept
    update_user_level(user_id, concept, new_level)

    return new_level