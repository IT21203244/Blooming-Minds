import os
from tensorflow.keras.preprocessing.image import ImageDataGenerator, load_img, img_to_array

# Define paths for input and output directories
input_dir = 'E:/BloomingMinds/ml-models/datasets/Preprocessed_Train'
output_dir = 'E:/BloomingMinds/ml-models/datasets/Augmented_Train'
os.makedirs(output_dir, exist_ok=True)

# Image dimensions
img_width, img_height = 128, 128

# Augmentation configuration
datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    brightness_range=(0.8, 1.2)
)

# Generate augmented images for each class folder (Lowercase and Uppercase)
for class_name in os.listdir(input_dir):
    class_input_path = os.path.join(input_dir, class_name)
    class_output_path = os.path.join(output_dir, class_name)
    os.makedirs(class_output_path, exist_ok=True)

    if not os.path.isdir(class_input_path):
        continue

    print(f"Processing class: {class_name}")
    
    # Loop through each letter subfolder (e.g., a/, b/, A/, B/)
    for subfolder_name in os.listdir(class_input_path):
        subfolder_path = os.path.join(class_input_path, subfolder_name)

        # Check if it's a directory (individual letter folder)
        if not os.path.isdir(subfolder_path):
            continue

        print(f"Processing folder: {subfolder_name}")
        
        # Loop through each image inside the subfolder (e.g., images of 'A')
        for img_name in os.listdir(subfolder_path):
            img_path = os.path.join(subfolder_path, img_name)

            # Skip any non-image files
            if not img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                continue

            try:
                # Load and preprocess the image
                img = load_img(img_path, target_size=(img_width, img_height))
                img_array = img_to_array(img)
                img_array = img_array.reshape((1,) + img_array.shape)  # Add batch dimension

                # Generate and save augmented images
                aug_count = 0
                for batch in datagen.flow(img_array, batch_size=1, save_to_dir=subfolder_path, save_prefix='aug', save_format='jpeg'):
                    aug_count += 1
                    print(f"Generated augmented image {aug_count} for {img_name}")
                    if aug_count >= 5:  # Save 5 augmented images per original image
                        break

            except PermissionError as e:
                print(f"PermissionError: Skipping file {img_path} due to access restrictions.")
                continue  # Skip files that cannot be opened due to permission issues

            except Exception as e:
                print(f"Error processing file {img_path}: {e}")
                continue  # Skip files with other types of errors

    print(f"Completed class: {class_name}")

print("Augmentation complete. Augmented images are saved in:", output_dir)
