import logging
import os
from pymongo import MongoClient

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class Database:
    def __init__(self):
        """
        Initialize the Database connection.
        Use environment variables for security.
        """
        try:
            mongo_uri = os.getenv("MONGO_URI", "mongodb+srv://blooming_minds:BsjsdM24@bloomingminds.n7ia1.mongodb.net/")
            self.client = MongoClient(mongo_uri)
            self.db = self.client["blooming_minds"]  # Database name
            self.transcriptions_collection = self.db["transcriptions"]  # Define collection
            logging.info("Connected to MongoDB successfully.")
        except Exception as e:
            logging.error(f"Error connecting to MongoDB: {e}")
            raise

    def insert_transcription_data(self, user_id, lesson_id, correctness):
        """
        Inserts transcription correctness data into the database.
        """
        try:
            document = {
                "userId": user_id,
                "lessonId": lesson_id,
                "correctness": correctness
            }
            self.transcriptions_collection.insert_one(document)
            logging.info("Transcription data inserted successfully.")
        except Exception as e:
            logging.error(f"Error inserting transcription data: {e}")
            raise

    def get_all_transcriptions(self):
        """
        Fetches all transcription data from the database.
        """
        try:
            transcriptions = list(self.transcriptions_collection.find({}, {"_id": 0}))  # Exclude MongoDB _id field
            return transcriptions
        except Exception as e:
            logging.error(f"Error fetching transcription data: {e}")
            raise
