import os
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image, ImageOps

# Get the absolute path of the backend directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

# Define model path dynamically
MODEL_PATH = os.path.join(BASE_DIR, "backend", "utils", "ReadWriteLearning", "model_hand_new.keras")

# Load the pre-trained model
model = load_model(MODEL_PATH)

# Label mapping (uppercase and lowercase letters)
word_dict = {i: chr(i + 65) for i in range(26)}
word_dict.update({i + 26: chr(i + 97) for i in range(26)})

def preprocess_image(image):
    image = image.resize((28, 28))
    image = ImageOps.grayscale(image)
    
    # Invert the image (invert the pixel values)
    image = ImageOps.invert(image)
    
    img_array = np.array(image) / 255.0  # Normalize the image
    img_array = img_array.reshape(1, 28, 28, 1)  # Reshape for model input
    return img_array

def predict_letter(image):
    try:
        img_array = preprocess_image(image)
        prediction = model.predict(img_array)
        predicted_class = np.argmax(prediction, axis=1)[0]
        return word_dict[predicted_class]
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return None

def calculate_pixel_accuracy(user_image, ideal_image):
    user_image = ImageOps.grayscale(user_image).resize((28, 28))
    ideal_image = ImageOps.grayscale(ideal_image).resize((28, 28))
    user_array = np.array(user_image)
    ideal_array = np.array(ideal_image)
    matching_pixels = np.sum(user_array == ideal_array)
    return (matching_pixels / ideal_array.size) * 100
