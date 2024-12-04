import os
import sys
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array

# Load the trained model
model_path = r"C:\Users\Dilshan\Desktop\Blooming-Minds\models\saved_models\Kinesthetic\Image_Traking\smile_detection_model.keras"
if not os.path.exists(model_path):
    print(f"Model file not found at: {model_path}")
    sys.exit(1)

model = load_model(model_path)
print("Model loaded successfully.")

# Preprocess the input image
def preprocess_image(image_path):
    try:
        img = load_img(image_path, target_size=(150, 150))  # Resize to match model's input
        img_array = img_to_array(img)  # Convert to numpy array
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = img_array / 255.0  # Normalize pixel values
        return img_array
    except Exception as e:
        print(f"Error loading image {image_path}: {e}")
        return None

# Predict smile percentage
def check_smile(image_path):
    img_array = preprocess_image(image_path)
    if img_array is None:
        return

    prediction = model.predict(img_array)
    smile_score = prediction[0][0]  # Model output is a single score between 0 and 1

    # Interpret the score
    if smile_score >= 0.75:
        result = f"Full smile detected! Smile Score: {smile_score * 100:.2f}%"
    elif smile_score >= 0.40:
        result = f"Small smile detected. Smile Score: {smile_score * 100:.2f}%"
    else:
        result = f"No smile detected. Smile Score: {smile_score * 100:.2f}%"

    print(result)

# Main function
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python check_smile.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(f"Image file not found: {image_path}")
        sys.exit(1)

    check_smile(image_path)
