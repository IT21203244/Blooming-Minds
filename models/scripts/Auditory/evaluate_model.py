import tensorflow as tf
from preprocess_data import preprocess_data

if __name__ == "__main__":
    # Load the test data
    dataset_path = "../../datasets/Auditory/AudioGame_session_data.csv"
    X_train, X_val, X_test, y_train, y_val, y_test = preprocess_data(dataset_path)
    
    # Load the trained model
    model_path = "../../saved_models/Auditory/audio_game_model.h5"
    model = tf.keras.models.load_model(model_path)
    
    # Evaluate the model
    loss, mae = model.evaluate(X_test, y_test)
    print(f"Test Loss: {loss}, Test MAE: {mae}")
