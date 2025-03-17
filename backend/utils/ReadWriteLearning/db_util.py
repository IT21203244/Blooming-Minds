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

    def get_ideal_letter_url(self, letter, letter_case):
        """
        Fetch the ideal letter image URL, pic_image_url, and video_url
        from the 'ideal_letters_to_compare' collection.
        """
        try:
            collection = self.db["ideal_letters_to_compare"]
            result = collection.find_one({"letter": letter, "case": letter_case})
            if result:
                return {
                    "image_url": result.get("image_url"),
                    "pic_image_url": result.get("pic_image_url"),
                    "video_url": result.get("video_url")
                }
            else:
                raise Exception(f"No ideal letter found for '{letter}' ({letter_case})")
        except Exception as e:
            raise Exception(f"Fetch error: {e}")

    def get_user_by_id(self, user_id):
        try:
            collection = self.db["users"]
            result = collection.find_one({"user_id": user_id})
            return result
        except Exception as e:
            raise Exception(f"Fetch user by ID error: {e}")

    def get_user_letters(self, user_id):
        """
        Fetch all letter records for a specific user, categorizing by letter case.
        """
        try:
            collection = self.db["letter_images"]
            results = collection.find({"user_id": user_id})
            letter_data = {}

            for record in results:
                letter = record["system_letter"]
                case = record["case"]

                if letter not in letter_data:
                    letter_data[letter] = {"uppercase": [], "lowercase": []}
                
                letter_data[letter][case].append({
                    "file_path": record["file_path"],
                    "uploaded_at": record["uploaded_at"],
                    "status": record["status"],
                    "system_letter": record["system_letter"],
                    "predicted_letter": record["predicted_letter"],
                    "accuracy": record["accuracy"]
                })

            return letter_data
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
        
    def get_user_letter_accuracy_history(self, user_id, system_letter, letter_case):
        """
        Fetch historical accuracy data for a specific user and letter.
        """
        try:
            collection = self.db["letter_images"]
            results = collection.find({
                "user_id": user_id,
                "system_letter": system_letter,
                "case": letter_case
            }).sort("uploaded_at", 1)  # Sort by timestamp

            historical_data = []
            for idx, record in enumerate(results):
                historical_data.append({
                    "attempt_number": idx + 1,
                    "accuracy": record["accuracy"],
                    "status": record["status"],
                    "uploaded_at": record["uploaded_at"]
                })

            return historical_data
        except Exception as e:
            raise Exception(f"Fetch historical data error: {e}")