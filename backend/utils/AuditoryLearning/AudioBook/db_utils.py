from pymongo import MongoClient
from bson.objectid import ObjectId


class Database:
    def __init__(self):
        """
        Initialize the Database connection.
        Replace the MongoDB connection string and database name as required.
        """
        try:
            self.client = MongoClient(
                "mongodb+srv://blooming_minds:BsjsdM24@bloomingminds.n7ia1.mongodb.net/"
            )
            self.db = self.client["blooming_minds"]  # Database name
        except Exception as e:
            raise Exception(f"Error connecting to MongoDB: {e}")

    def insert_data(self, collection_name, data):
        """
        Insert data into the specified collection.
        
        Args:
            collection_name (str): Name of the collection.
            data (dict): Data to be inserted.

        Returns:
            str: ID of the inserted document.
        """
        try:
            collection = self.db[collection_name]
            result = collection.insert_one(data)
            return str(result.inserted_id)
        except Exception as e:
            raise Exception(f"Error inserting data into {collection_name}: {e}")

    def get_data(self, collection_name):
        """
        Fetch all documents from the specified collection.
        
        Args:
            collection_name (str): Name of the collection.

        Returns:
            list: List of documents in the collection.
        """
        try:
            collection = self.db[collection_name]
            lessons = list(collection.find())  # Fetch all documents
            for lesson in lessons:
                lesson["_id"] = str(lesson["_id"])  # Convert ObjectId to string
            return lessons
        except Exception as e:
            raise Exception(f"Error fetching data from {collection_name}: {e}")

    def get_data_by_id(self, collection_name, document_id):
        """
        Fetch a single document by its ID from the specified collection.

        Args:
            collection_name (str): Name of the collection.
            document_id (str): The ID of the document to fetch.

        Returns:
            dict: The document if found, or None if not found.
        """
        try:
            collection = self.db[collection_name]
            document = collection.find_one({"_id": ObjectId(document_id)})
            if document:
                document["_id"] = str(document["_id"])  # Convert ObjectId to string
            return document
        except Exception as e:
            raise Exception(f"Error fetching document by ID from {collection_name}: {e}")

    def close_connection(self):
        """
        Close the MongoDB connection.
        """
        try:
            self.client.close()
        except Exception as e:
            raise Exception(f"Error closing MongoDB connection: {e}")
