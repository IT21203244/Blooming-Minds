import argparse
import os
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import matplotlib.pyplot as plt


def load_and_preprocess_image(image_path, target_size):
    """Load and preprocess the image for prediction."""
    try:
        img = load_img(image_path, target_size=target_size, color_mode='rgb')
        img_array = img_to_array(img) / 255.0  # Normalize to [0, 1]
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        return img_array
    except Exception as e:
        raise ValueError(f"Error processing image {image_path}: {e}")


def predict_image(model, image_path, class_labels, target_size=(128, 128)):
    """Predict the class of a single image."""
    try:
        img_array = load_and_preprocess_image(image_path, target_size)
        prediction = model.predict(img_array)
        predicted_index = np.argmax(prediction)
        confidence = np.max(prediction)
        predicted_label = class_labels[predicted_index]
        return predicted_label, confidence, prediction
    except Exception as e:
        return str(e), None, None


def batch_predict(model, image_dir, class_labels, target_size):
    """Predict classes for all images in a directory."""
    predictions = []
    image_files = [f for f in os.listdir(image_dir) if os.path.isfile(os.path.join(image_dir, f))]
    
    if not image_files:
        raise ValueError(f"No image files found in directory: {image_dir}")

    for image_file in image_files:
        image_path = os.path.join(image_dir, image_file)
        predicted_label, confidence, prediction_probs = predict_image(
            model, image_path, class_labels, target_size
        )
        predictions.append({
            "Image": image_file,
            "Predicted_Label": predicted_label,
            "Confidence": confidence,
            "Probabilities": prediction_probs.tolist(),
        })
    return predictions


def visualize_prediction(image_path, predicted_label, confidence):
    """Visualize the image with the prediction."""
    img = load_img(image_path)
    plt.imshow(img)
    plt.title(f"Prediction: {predicted_label} ({confidence*100:.2f}%)")
    plt.axis("off")
    plt.show()


def main(args):
    # Load model
    try:
        model = load_model(args.model_path)
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    # Define class labels (can be made dynamic)
    class_labels = {0: "Lowercase", 1: "Uppercase"}

    # Single image prediction
    if args.image_path:
        if not os.path.exists(args.image_path):
            print(f"Error: Image path '{args.image_path}' does not exist.")
            return
        predicted_label, confidence, _ = predict_image(
            model, args.image_path, class_labels, target_size=(args.img_width, args.img_height)
        )
        if confidence:
            print(f"Predicted Class: {predicted_label}, Confidence: {confidence:.2f}")
            visualize_prediction(args.image_path, predicted_label, confidence)
        else:
            print(f"Error: {predicted_label}")

    # Batch prediction
    elif args.image_dir:
        if not os.path.exists(args.image_dir):
            print(f"Error: Image directory '{args.image_dir}' does not exist.")
            return
        try:
            predictions = batch_predict(
                model, args.image_dir, class_labels, target_size=(args.img_width, args.img_height)
            )
            # Save predictions to a CSV file
            results_df = pd.DataFrame(predictions)
            results_df.to_csv("predictions.csv", index=False)
            print("Batch predictions saved to 'predictions.csv'.")
        except ValueError as e:
            print(e)
    else:
        print("Error: You must provide either an --image_path or --image_dir argument.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Image Classification Inference Script")
    parser.add_argument("--model_path", type=str, required=True, help="Path to the trained model.")
    parser.add_argument("--image_path", type=str, help="Path to the image to predict.")
    parser.add_argument("--image_dir", type=str, help="Directory containing images for batch prediction.")
    parser.add_argument("--img_width", type=int, default=128, help="Width of input image.")
    parser.add_argument("--img_height", type=int, default=128, help="Height of input image.")
    args = parser.parse_args()

    main(args)
