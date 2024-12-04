import os
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam

# Dataset Path
base_dir = r"C:\Users\Dilshan\Desktop\Blooming-Minds\models\datasets\Kinesthetic\Smile"

# Ensure valid images in the dataset
def validate_and_clean_dataset(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with Image.open(file_path) as img:
                    img.verify()  # Verify image integrity
            except (IOError, SyntaxError, Image.DecompressionBombError):
                print(f"Removing invalid image: {file_path}")
                os.remove(file_path)

validate_and_clean_dataset(base_dir)

# Data Generators
datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2,  # 80% training, 20% validation
)

train_gen = datagen.flow_from_directory(
    base_dir,
    target_size=(150, 150),
    batch_size=32,
    class_mode='binary',
    subset='training',
)

val_gen = datagen.flow_from_directory(
    base_dir,
    target_size=(150, 150),
    batch_size=32,
    class_mode='binary',
    subset='validation',
)

# Model Definition
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Flatten(),
    Dense(128, activation='relu'),
    Dense(1, activation='sigmoid'),  # Binary classification
])

model.compile(optimizer=Adam(learning_rate=0.001),
              loss='binary_crossentropy',
              metrics=['accuracy'])

# Training the Model with Exception Handling
try:
    model.fit(
        train_gen,
        steps_per_epoch=train_gen.samples // train_gen.batch_size,
        validation_data=val_gen,
        validation_steps=val_gen.samples // val_gen.batch_size,
        epochs=20,
    )
except Exception as e:
    print(f"Error during training: {e}")

# Save Model
model_dir = r"C:\Users\Dilshan\Desktop\Blooming-Minds\models\saved_models\Kinesthetic\Image_Traking"
os.makedirs(model_dir, exist_ok=True)  # Ensure directory exists
model_path = os.path.join(model_dir, "smile_detection_model.keras")  # Add file name with extension
model.save(model_path)
print(f"Model trained and saved at: {model_path}")
