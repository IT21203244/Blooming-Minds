import os
import math
import json
import numpy as np
import tensorflow as tf
from datetime import datetime
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout, BatchNormalization
from tensorflow.keras.applications import VGG16
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
import matplotlib.pyplot as plt

# Ensure directories exist
def ensure_dir(directory):
    os.makedirs(directory, exist_ok=True)

# Base directories
base_dir = 'E:/BloomingMinds/ml-models'
train_dir = os.path.join(base_dir, 'datasets/Preprocessed_Train')
val_dir = os.path.join(base_dir, 'datasets/Preprocessed_Validation')
test_dir = os.path.join(base_dir, 'datasets/Preprocessed_Test')

# Directories for saving models and logs
initial_training_dir = os.path.join(base_dir, 'saved_models/initial_training')
fine_tuning_dir = os.path.join(base_dir, 'saved_models/fine_tuning')
ensure_dir(initial_training_dir)
ensure_dir(fine_tuning_dir)

# TensorBoard log directory
timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_log_dir = os.path.join(base_dir, f'logs/{timestamp}')
ensure_dir(tensorboard_log_dir)

# Image dimensions and batch size
img_width, img_height = 128, 128
batch_size = 32

# Data Augmentation for training
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=40,
    width_shift_range=0.3,
    height_shift_range=0.3,
    shear_range=0.3,
    zoom_range=0.3,
    horizontal_flip=True,
    brightness_range=(0.8, 1.2),
    fill_mode='nearest'
)

# Validation/Test data preprocessing
val_test_datagen = ImageDataGenerator(rescale=1.0 / 255)

# Data Generators
train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=True
)

validation_generator = val_test_datagen.flow_from_directory(
    val_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical'
)

test_generator = val_test_datagen.flow_from_directory(
    test_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical'
)

# Transfer learning with VGG16
base_model = VGG16(weights='imagenet', include_top=False, input_shape=(img_width, img_height, 3))
base_model.trainable = False  # Freeze the base model

# Add custom layers
model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(512, activation='relu'),
    BatchNormalization(),
    Dropout(0.5),
    Dense(train_generator.num_classes, activation='softmax')  # Dynamic class count
])

# Compile the model
model.compile(optimizer=Adam(learning_rate=1e-4),
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Callbacks
callbacks = [
    ModelCheckpoint(os.path.join(initial_training_dir, 'best_model_vgg16.keras'),
                    save_best_only=True, monitor='val_loss', mode='min'),
    EarlyStopping(monitor='val_loss', patience=7, restore_best_weights=True),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-6),
    TensorBoard(log_dir=tensorboard_log_dir)
]

# Train the model
history = model.fit(
    train_generator,
    steps_per_epoch=math.ceil(train_generator.samples / batch_size),
    epochs=30,
    validation_data=validation_generator,
    validation_steps=math.ceil(validation_generator.samples / batch_size),
    callbacks=callbacks
)

# Save training history
with open(os.path.join(initial_training_dir, 'history.json'), 'w') as f:
    json.dump(history.history, f)

# Unfreeze the base model for fine-tuning
base_model.trainable = True
model.compile(optimizer=Adam(learning_rate=1e-5),
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Fine-tune the model
history_fine_tune = model.fit(
    train_generator,
    steps_per_epoch=math.ceil(train_generator.samples / batch_size),
    epochs=10,
    validation_data=validation_generator,
    validation_steps=math.ceil(validation_generator.samples / batch_size),
    callbacks=callbacks
)

# Save fine-tuning history
with open(os.path.join(fine_tuning_dir, 'history_fine_tune.json'), 'w') as f:
    json.dump(history_fine_tune.history, f)

# Save the final model
model.save(os.path.join(fine_tuning_dir, 'final_model_vgg16.keras'))

# Evaluate on the test set
test_loss, test_acc = model.evaluate(test_generator)
print(f'Test accuracy: {test_acc:.4f}')

# Plot training history
def plot_history(history, title):
    plt.figure(figsize=(12, 6))
    plt.plot(history['accuracy'], label='Train Accuracy')
    plt.plot(history['val_accuracy'], label='Validation Accuracy')
    plt.plot(history['loss'], label='Train Loss')
    plt.plot(history['val_loss'], label='Validation Loss')
    plt.title(title)
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy/Loss')
    plt.legend()
    plt.grid()
    plt.show()

plot_history(history.history, "Initial Training Performance")
plot_history(history_fine_tune.history, "Fine-tuning Performance")
