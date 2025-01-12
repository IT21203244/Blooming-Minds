from pymongo import MongoClient
from PIL import Image
import os
import base64

# MongoDB connection
DB_URI = "mongodb+srv://blooming_minds:BsjsdM24@bloomingminds.n7ia1.mongodb.net/"
client = MongoClient(DB_URI)
db = client["blooming_minds"]

# Collection to store ideal letters
collection = db["ideal_letters"]

# Directory containing ideal letters
IDEAL_LETTERS_DIR = "E:/BloomingMinds/ml-models/datasets/ideal_letters"

def upload_ideal_letters():
    try:
        for subdir, _, files in os.walk(IDEAL_LETTERS_DIR):
            for file in files:
                if file.endswith(".png"):
                    letter = os.path.splitext(file)[0]  # Extract letter from file name
                    image_path = os.path.join(subdir, file)

                    # Open the image and encode it as base64
                    with open(image_path, "rb") as img_file:
                        image_blob = base64.b64encode(img_file.read()).decode("utf-8")

                    # Determine if it's uppercase or lowercase
                    case = "uppercase" if letter.isupper() else "lowercase"

                    # Insert into MongoDB
                    collection.insert_one({
                        "letter": letter,
                        "case": case,
                        "image_blob": image_blob
                    })
                    print(f"Uploaded {letter}")
    except Exception as e:
        print(f"Error uploading ideal letters: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    upload_ideal_letters()
