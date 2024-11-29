import os
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
import matplotlib.pyplot as plt

# Paths to the folders containing your images
smiling_folder = '../../datasets/Kinesthetic/Smile/smile'
not_smiling_folder = '../../datasets/Kinesthetic/Smile/not_smiling'

# Function to load images
def load_images_from_folder(folder, label, image_size=(128, 128)):
    images = []
    labels = []
    for filename in os.listdir(folder):
        img_path = os.path.join(folder, filename)
        img = cv2.imread(img_path)
        if img is not None:
            img = cv2.resize(img, image_size)
            images.append(img)
            labels.append(label)
    return images, labels

# Load images from both folders
smiling_images, smiling_labels = load_images_from_folder(smiling_folder, label=1)
not_smiling_images, not_smiling_labels = load_images_from_folder(not_smiling_folder, label=0)

# Combine the data
images = np.array(smiling_images + not_smiling_images)
labels = np.array(smiling_labels + not_smiling_labels)

# Normalize the pixel values to range [0, 1]
images = images / 255.0

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(images, labels, test_size=0.2, random_state=42)

# Print dataset sizes
print(f"Training set size: {len(X_train)}")
print(f"Test set size: {len(X_test)}")

# Data Augmentation
datagen = ImageDataGenerator(
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

# Fit the data augmentation
datagen.fit(X_train)

# Load a pre-trained MobileNet model without the top classification layer
base_model = tf.keras.applications.MobileNetV2(weights='imagenet', include_top=False, input_shape=(128, 128, 3))

# Freeze the base model layers
base_model.trainable = False

# Create a new model on top of the base model
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Callbacks for early stopping, model checkpointing, and learning rate reduction
early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
checkpoint = ModelCheckpoint('../../saved_models/Kinesthetic/best_smile_model.keras', 
                             monitor='val_accuracy', save_best_only=True, mode='max')
lr_reduction = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-6)

# Train the model with increased epochs (20 epochs)
history = model.fit(datagen.flow(X_train, y_train, batch_size=32), 
                    epochs=40, validation_data=(X_test, y_test),
                    callbacks=[early_stopping, checkpoint, lr_reduction])

# Evaluate the model on the test set
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"Test accuracy: {test_acc}")

# Save the trained model
model.save('../../saved_models/Kinesthetic/smile_detection_model.h5')
print("Model saved as smile_detection_model.h5")

# Optionally, plot the training history
plt.plot(history.history['accuracy'], label='accuracy')
plt.plot(history.history['val_accuracy'], label='val_accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.ylim([0, 1])
plt.legend(loc='lower right')
plt.show()
