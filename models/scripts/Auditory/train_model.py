import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from preprocess_data import preprocess_data

def build_model(input_shape):
    # Define a Sequential model
    model = Sequential([
        Dense(64, activation='relu', input_shape=(input_shape,)),
        Dense(32, activation='relu'),
        Dense(1, activation='linear')  # Regression output
    ])
    
    # Compile the model
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model

if __name__ == "__main__":
    # Preprocess data
    dataset_path = "../../datasets/Auditory/AudioGame_session_data.csv"
    X_train, X_val, X_test, y_train, y_val, y_test = preprocess_data(dataset_path)
    
    # Build and train the model
    model = build_model(input_shape=X_train.shape[1])
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=50,
        batch_size=16
    )
    
    # Save the trained model
    model.save("../../saved_models/Auditory/audio_game_model.h5")
    print("Model training completed and saved successfully.")
