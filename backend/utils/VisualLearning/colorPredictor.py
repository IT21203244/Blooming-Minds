import numpy as np
from keras.models import Sequential, load_model
from keras.layers import LSTM, Dense, Dropout
from keras.optimizers import Adam
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from collections import defaultdict
import logging
import os
from pymongo import MongoClient
import json
from bson import json_util

logger = logging.getLogger(__name__)

class ColorPredictor:
    def __init__(self, model_path=None):
        self.model_path = model_path or 'color_lstm_model.keras'
        self.color_encoder = LabelEncoder()
        self.known_colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown']
        self.color_encoder.fit(self.known_colors)
        self.max_sequence_length = 10  # Maximum sequence length to consider
        self.num_colors = len(self.known_colors)
        
        # Initialize model
        if os.path.exists(self.model_path):
            self.model = load_model(self.model_path)
            logger.info("Loaded existing LSTM model")
        else:
            self.model = self._build_model()
            logger.info("Created new LSTM model")
            
        # MongoDB connection
        self.client = MongoClient("mongodb+srv://blooming_minds:BsjsdM24@bloomingminds.n7ia1.mongodb.net/")
        self.db = self.client["blooming_minds"]
            
    def _build_model(self):
        model = Sequential([
            LSTM(64, input_shape=(self.max_sequence_length, self.num_colors)),
            Dropout(0.2),
            Dense(64, activation='relu'),
            Dense(self.num_colors, activation='softmax')
        ])
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        return model
    
    def _sequence_to_matrix(self, sequence):
        """Convert color sequence to one-hot encoded matrix"""
        encoded = self.color_encoder.transform(sequence)
        matrix = np.zeros((len(sequence), self.num_colors))
        for i, color_idx in enumerate(encoded):
            matrix[i, color_idx] = 1
        return matrix
    
    def _pad_sequence(self, sequence):
        """Pad sequence to fixed length"""
        if len(sequence) > self.max_sequence_length:
            return sequence[-self.max_sequence_length:]
        return sequence + [''] * (self.max_sequence_length - len(sequence))
    
    def train_model(self, sequences, next_colors, epochs=20, batch_size=32):
        """
        Train the LSTM model on historical color sequences and next colors
        """
        # Preprocess sequences
        X = np.array([self._sequence_to_matrix(self._pad_sequence(seq)) for seq in sequences])
        y = self.color_encoder.transform(next_colors)
        y = np.eye(self.num_colors)[y]  # One-hot encode
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2)
        
        # Train model
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            verbose=1
        )
        
        # Save model
        self.model.save(self.model_path)
        logger.info(f"Model saved to {self.model_path}")
        
        return history
    
    def predict_next_color(self, sequence):
        """Predict the most likely next color in a sequence"""
        if not sequence:
            return np.random.choice(self.known_colors)
            
        padded = self._pad_sequence(sequence)
        matrix = self._sequence_to_matrix(padded)
        matrix = np.expand_dims(matrix, axis=0)  # Add batch dimension
        
        predictions = self.model.predict(matrix)
        predicted_idx = np.argmax(predictions[0])
        return self.color_encoder.inverse_transform([predicted_idx])[0]
    
    def generate_suggestions(self, user_id, level='easy'):
        """
        Generate personalized color suggestions based on user's mistake patterns
        """
        # Get user's color profile from database
        profile = self.db.user_color_profiles.find_one({"user_id": user_id})
        if not profile:
            # If no profile exists, return a default sequence
            count = LEVEL_CIRCLE_COUNTS.get(level, 3)
            return np.random.choice(self.known_colors, size=count, replace=True).tolist()
        
        # Get user's mistake patterns
        mistake_patterns = profile.get("mistake_patterns", {})
        difficult_colors = sorted(mistake_patterns.items(), key=lambda x: x[1], reverse=True)
        
        # Determine sequence length based on level
        seq_length = LEVEL_CIRCLE_COUNTS.get(level, 3)
        
        # Generate sequence with more frequent difficult colors
        sequence = []
        if difficult_colors:
            # Include top 2 difficult colors
            top_colors = [color for color, count in difficult_colors[:2]]
            remaining_slots = max(0, seq_length - len(top_colors))
            
            # Fill remaining slots with other colors
            other_colors = [color for color in self.known_colors if color not in top_colors]
            sequence = top_colors + np.random.choice(other_colors, size=remaining_slots, replace=True).tolist()
        else:
            # No difficult colors identified, return random sequence
            sequence = np.random.choice(self.known_colors, size=seq_length, replace=True).tolist()
        
        # Shuffle the sequence to avoid predictability
        np.random.shuffle(sequence)
        
        return sequence[:seq_length]  # Ensure correct length

# Global instance
LEVEL_CIRCLE_COUNTS = {"easy": 3, "medium": 5, "hard": 7}