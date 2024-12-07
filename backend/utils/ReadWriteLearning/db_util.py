from pymongo import MongoClient

class Database:
    def __init__(self):
        try:
            self.client = MongoClient(
                "mongodb+srv://blooming_minds:BsjsdM24@bloomingminds.n7ia1.mongodb.net/"
            )
            self.db = self.client["blooming_minds"]
        except Exception as e:
            raise Exception(f"Database connection error: {e}")

    def insert_data(self, collection_name, data):
        try:
            collection = self.db[collection_name]
            result = collection.insert_one(data)
            print(f"Data inserted: {data}")  # Debugging log
            return str(result.inserted_id)
        except Exception as e:
            print(f"Insert error: {e}")  # Enhanced error logging
            raise Exception(f"Insert error: {e}")

    def get_ideal_letter(self, letter):
        try:
            collection = self.db["ideal_letters"]
            result = collection.find_one({"letter": letter})
            if result:
                return result["image_blob"]
            else:
                raise Exception(f"No ideal letter found for '{letter}'")
        except Exception as e:
            raise Exception(f"Fetch error: {e}")

    def get_user_letters(self, user_id):
        """
        Fetch all letter records for a specific user.
        """
        try:
            collection = self.db["letter_images"]
            results = collection.find({"user_id": user_id})
            return list(results)
        except Exception as e:
            raise Exception(f"Fetch user letters error: {e}")
        
    def get_user_letter_by_letter(self, user_id, letter):
        try:
            collection = self.db["letter_images"]
            result = collection.find_one({"user_id": user_id, "system_letter": letter})
            return result
        except Exception as e:
            raise Exception(f"Fetch user letter by letter error: {e}")


    def close_connection(self):
        try:
            self.client.close()
        except Exception as e:
            raise Exception(f"Closing connection error: {e}")
