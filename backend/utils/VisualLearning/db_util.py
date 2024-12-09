from pymongo import MongoClient
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime

# MongoDB connection setup
MONGO_URI = "mongodb+srv://blooming_minds:BsjsdM24@bloomingminds.n7ia1.mongodb.net/"
DATABASE_NAME = "blooming_minds"

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

def insert_color_matching_result(user_id, level, wrong_takes, correct_takes, total_score, time_taken, provided_sequence, child_sequence, date):
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
            "date": result.get("date")
        }
        for result in results
    ]

# Fetch all color matching results and convert them to a DataFrame for analysis
def analyze_color_matching_trends(user_id=None, start_date=None, end_date=None):
    """
    Analyzes trends in color matching game results, such as accuracy, completion time, and error frequency.
    Returns a DataFrame of aggregated data.
    """
    # Get results from the database
    results = get_color_matching_results(user_id)
    
    # Filter by date range if provided
    if start_date and end_date:
        results = [result for result in results if start_date <= datetime.strptime(result['date'], "%Y-%m-%d").date() <= end_date]
    
    # Convert results to a DataFrame for easy analysis
    df = pd.DataFrame(results)
    
    # Convert date to datetime object for plotting
    df['date'] = pd.to_datetime(df['date'])
    
    # Compute accuracy as the ratio of correct_takes to total attempts (correct_takes + wrong_takes)
    df['accuracy'] = df['correct_takes'] / (df['correct_takes'] + df['wrong_takes']) * 100
    
    # Calculate the average completion time per level
    df['avg_time_per_level'] = df.groupby('level')['time_taken'].transform('mean')
    
    # Calculate error frequency
    df['error_frequency'] = df['wrong_takes'] / (df['correct_takes'] + df['wrong_takes']) * 100
    
    return df

# Function to generate a plot for accuracy over time
def plot_accuracy_vs_time(df):
    plt.figure(figsize=(10, 5))
    for level in df['level'].unique():
        level_data = df[df['level'] == level]
        plt.plot(level_data['date'], level_data['accuracy'], label=f"Level {level}")
    
    plt.title('Accuracy Over Time')
    plt.xlabel('Date')
    plt.ylabel('Accuracy (%)')
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('accuracy_vs_time.png')
    plt.close()

# Function to generate a plot for completion time per level
def plot_avg_time_per_level(df):
    avg_time = df.groupby('level')['avg_time_per_level'].mean()
    avg_time.plot(kind='bar', figsize=(8, 5))
    plt.title('Average Completion Time per Level')
    plt.xlabel('Level')
    plt.ylabel('Average Time (seconds)')
    plt.tight_layout()
    plt.savefig('avg_time_per_level.png')
    plt.close()

# Function to generate a plot for error frequency per level
def plot_error_frequency(df):
    error_freq = df.groupby('level')['error_frequency'].mean()
    error_freq.plot(kind='bar', figsize=(8, 5), color='red')
    plt.title('Error Frequency per Level')
    plt.xlabel('Level')
    plt.ylabel('Error Frequency (%)')
    plt.tight_layout()
    plt.savefig('error_frequency.png')
    plt.close()