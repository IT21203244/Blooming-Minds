import tensorflow as tf
from preprocess_data import preprocess_data

# Define or import the 'mse' function if it is a custom loss or metric
# If it's the standard mean squared error, you can use tf.keras.losses.MeanSquaredError
def mse(y_true, y_pred):
    return tf.keras.losses.mean_squared_error(y_true, y_pred)

def predict_score(model_path, input_data):
    # Load the trained model with the correct custom objects (e.g., mse)
    model = tf.keras.models.load_model(model_path, custom_objects={"mse": mse})
    
    # Predict the score (make predictions)
    predictions = model.predict(input_data)
    return predictions

if __name__ == "__main__":
    # Define your input data or load it here
    dataset_path = "../../datasets/Auditory/AudioGame_session_data.csv"
    X_train, X_val, X_test, y_train, y_val, y_test = preprocess_data(dataset_path)

    # Provide a sample input data for prediction (can be from X_test, or some new input)
    input_data = X_test[:5]  # For example, predicting for the first 5 rows of the test set

    model_path = "../../saved_models/Auditory/audio_game_model.h5"
    predicted_score = predict_score(model_path, input_data)
    
    # Print predictions
    print("Predictions:", predicted_score)
