from pymongo import MongoClient
from bson.objectid import ObjectId

class GameDatabase:
    def __init__(self):
        """
        Initialize the Database connection for audiogames.
        """
        try:
            self.client = MongoClient(
                "mongodb+srv://blooming_minds:BsjsdM24@bloomingminds.n7ia1.mongodb.net/"
            )
            self.db = self.client["blooming_minds"]  # Database name
        except Exception as e:
            raise Exception(f"Error connecting to MongoDB: {e}")

    def insert_game(self, collection_name, data):
        """
        Insert a game into the specified collection.

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

    def get_games(self, collection_name):
        """
        Fetch all games from the specified collection.

        Args:
            collection_name (str): Name of the collection.

        Returns:
            list: List of documents in the collection.
        """
        try:
            collection = self.db[collection_name]
            games = list(collection.find())  # Fetch all documents
            for game in games:
                game["_id"] = str(game["_id"])  # Convert ObjectId to string
            return games
        except Exception as e:
            raise Exception(f"Error fetching data from {collection_name}: {e}")

    def get_game_by_id(self, collection_name, game_id):
        """
        Fetch a single game by its ID from the specified collection.

        Args:
            collection_name (str): Name of the collection.
            game_id (str): The ID of the document to fetch.

        Returns:
            dict: The document if found, or None if not found.
        """
        try:
            collection = self.db[collection_name]
            game = collection.find_one({"_id": ObjectId(game_id)})
            if game:
                game["_id"] = str(game["_id"])  # Convert ObjectId to string
            return game
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

    def insert_audiogame_result(self, data):
        """
        Insert an audiogame result into the audiogame_results collection.

        Args:
            data (dict): Data to be inserted.

        Returns:
            str: ID of the inserted document.
        """
        try:
            collection = self.db["audiogame_results"]  # New collection
            result = collection.insert_one(data)
            return str(result.inserted_id)
        except Exception as e:
            raise Exception(f"Error inserting data into audiogame_results: {e}")

    def get_audiogame_results(self):
        """
        Fetch all audiogame results from the audiogame_results collection.

        Returns:
            list: List of documents in the audiogame_results collection.
        """
        try:
            collection = self.db["audiogame_results"]
            results = list(collection.find())  # Fetch all documents
            for result in results:
                result["_id"] = str(result["_id"])  # Convert ObjectId to string
            return results
        except Exception as e:
            raise Exception(f"Error fetching data from audiogame_results: {e}")
