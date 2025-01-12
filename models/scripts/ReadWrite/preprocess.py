import os
import cv2

def preprocess_image(input_path, output_path):
    """
    Preprocess an individual image:
    - Convert to grayscale.
    - Resize to 128x128 pixels.
    - Save the preprocessed image.
    """
    try:
        # Read the image
        image = cv2.imread(input_path)
        if image is None:
            print(f"Skipping invalid or non-image file: {input_path}")
            return

        # Resize image to 64x64 pixels
        image_resized = cv2.resize(image, (128, 128))

        # Convert to grayscale
        gray_image = cv2.cvtColor(image_resized, cv2.COLOR_BGR2GRAY)

        # Save the processed image
        cv2.imwrite(output_path, gray_image)
        print(f"Processed and saved: {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

def preprocess_dataset(input_dataset_path, output_dataset_path):
    """
    Preprocess the entire dataset:
    - For each letter folder, process all images inside.
    - Save processed images in the corresponding output folder.
    """
    # Loop through each letter folder (Lowercase/Uppercase)
    for letter_folder in os.listdir(input_dataset_path):
        letter_folder_path = os.path.join(input_dataset_path, letter_folder)

        if os.path.isdir(letter_folder_path):  # Check if it's a folder (Lowercase, Uppercase)
            # Loop through each subfolder (a, b, c, ...) under Lowercase and Uppercase
            for letter_image_folder in os.listdir(letter_folder_path):
                letter_image_folder_path = os.path.join(letter_folder_path, letter_image_folder)

                if os.path.isdir(letter_image_folder_path):  # Check if it's a folder for a specific letter (e.g., a)
                    # Create corresponding output folder for the letter
                    output_letter_folder = os.path.join(output_dataset_path, letter_folder, letter_image_folder)
                    if not os.path.exists(output_letter_folder):
                        os.makedirs(output_letter_folder)

                    # Now loop through the images in the individual letter subfolder (image1.png, image2.png, ...)
                    for file_name in os.listdir(letter_image_folder_path):
                        input_file = os.path.join(letter_image_folder_path, file_name)

                        if os.path.isfile(input_file) and file_name.lower().endswith(('.jpg', '.jpeg', '.png')):
                            # Create corresponding output path for the processed image
                            output_file = os.path.join(output_letter_folder, file_name)

                            # Ensure the output subfolder exists
                            if not os.path.exists(os.path.dirname(output_file)):
                                os.makedirs(os.path.dirname(output_file))

                            print(f"Processing image: {input_file}")
                            preprocess_image(input_file, output_file)
                        else:
                            print(f"Skipping non-image file: {input_file}")

# Define paths
input_dataset_path = r"E:\BloomingMinds\ml-models\datasets\Dataset_Train"
output_dataset_path = r"E:\BloomingMinds\ml-models\datasets\Preprocessed_Train"

# Preprocess the dataset
preprocess_dataset(input_dataset_path, output_dataset_path)

# Define paths for validation and test datasets
input_validation_dataset_path = r"E:\BloomingMinds\ml-models\datasets\Dataset_Validation"
output_validation_dataset_path = r"E:\BloomingMinds\ml-models\datasets\Preprocessed_Validation"

input_test_dataset_path = r"E:\BloomingMinds\ml-models\datasets\Dataset_Test"
output_test_dataset_path = r"E:\BloomingMinds\ml-models\datasets\Preprocessed_Test"

# Preprocess the validation dataset
preprocess_dataset(input_validation_dataset_path, output_validation_dataset_path)

# Preprocess the test dataset
preprocess_dataset(input_test_dataset_path, output_test_dataset_path)

