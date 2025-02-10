from pymongo import MongoClient
import datetime
import os
import logging

# MongoDB connection setup
MONGO_URI = "mongodb+srv://blooming_minds:BsjsdM24@bloomingminds.n7ia1.mongodb.net/"
DATABASE_NAME = "blooming_minds"

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

def insert_color_matching_result(
    user_id, level, wrong_takes, correct_takes, total_score, time_taken,
    provided_sequence, child_sequence, circle_count, wrong_circle_count,
    date, accuracy, time_efficiency, reward
):
    """
    Inserts a new color matching game result into the database.
    """
    collection = db.color_matching_results

    # Document structure
    result_document = {
        "user_id": user_id,
        "level": level,
        "wrong_takes": wrong_takes,
        "correct_takes": correct_takes,
        "total_score": total_score,
        "time_taken": time_taken,
        "provided_sequence": provided_sequence,
        "child_sequence": child_sequence,
        "circle_count": circle_count,  # Store the user's circle count input
        "wrong_circle_count": wrong_circle_count,  # Store the difference between expected and actual circle count
        "accuracy": accuracy,  # Accuracy of the game
        "time_efficiency": time_efficiency,  # Efficiency based on time
        "reward": reward,  # Reward points
        "date": date
    }

    # Insert into collection
    result = collection.insert_one(result_document)

    return str(result.inserted_id)  # Return the ID of the inserted document

def get_color_matching_results(user_id=None):
    """
    Retrieves color matching game results from the database.
    If user_id is provided, fetch results only for that user.
    """
    collection = db.color_matching_results

    # Query filter
    query = {"user_id": user_id} if user_id else {}

    # Fetch results from the database
    results = collection.find(query)

    # Convert results to a list of dictionaries
    return [
        {
            "user_id": result.get("user_id"),
            "level": result.get("level"),
            "wrong_takes": result.get("wrong_takes"),
            "correct_takes": result.get("correct_takes"),
            "total_score": result.get("total_score"),
            "time_taken": result.get("time_taken"),
            "provided_sequence": result.get("provided_sequence"),
            "child_sequence": result.get("child_sequence"),
            "circle_count": result.get("circle_count"),  # User's circle count
            "wrong_circle_count": result.get("wrong_circle_count"),  # Difference between expected and actual circle count
            "accuracy": result.get("accuracy"),  # Accuracy of the game
            "time_efficiency": result.get("time_efficiency"),  # Efficiency based on time
            "reward": result.get("reward"),  # Reward points
            "date": result.get("date")
        }
        for result in results
    ]

def get_first_result_per_level(user_id):
    """
    Fetches the first game result for each level (easy, medium, hard) for the given user_id.
    """
    collection = db.color_matching_results

    # Aggregation pipeline to fetch the first result per level
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$sort": {"date": 1}},  # Ensure results are sorted by date ascending
        {"$group": {
            "_id": "$level",
            "level": {"$first": "$level"},
            "user_id": {"$first": "$user_id"},
            "wrong_takes": {"$first": "$wrong_takes"},
            "correct_takes": {"$first": "$correct_takes"},
            "total_score": {"$first": "$total_score"},
            "time_taken": {"$first": "$time_taken"},
            "provided_sequence": {"$first": "$provided_sequence"},
            "child_sequence": {"$first": "$child_sequence"},
            "circle_count": {"$first": "$circle_count"},
            "wrong_circle_count": {"$first": "$wrong_circle_count"},
            "accuracy": {"$first": "$accuracy"},
            "time_efficiency": {"$first": "$time_efficiency"},
            "reward": {"$first": "$reward"},
            "date": {"$first": "$date"}  # Ensure date is included
        }}
    ]

    results = collection.aggregate(pipeline)
    return {result["_id"]: result for result in results}


# Finger Counting Game 
def insert_finger_counting_session(user_id, number_data, total_attempt_count, date, level):
    """
    Inserts a new finger counting session result into the database.
    """
    collection = db.finger_counting_results
    
    result_document = {
        "user_id": user_id,
        "number_data": number_data,
        "total_attempt_count": total_attempt_count,
        "date": date,
        "level": level
    }

    result = collection.insert_one(result_document)
    return str(result.inserted_id)