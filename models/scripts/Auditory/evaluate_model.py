import tensorflow as tf
from preprocess_data import preprocess_data

# Define the MeanSquaredError loss class
def mse(y_true, y_pred):
    mse_loss = tf.keras.losses.MeanSquaredError()
    return mse_loss(y_true, y_pred)

if __name__ == "__main__":
    # Load the test data
    dataset_path = "../../datasets/Auditory/AudioGame_session_data.csv"
    X_train, X_val, X_test, y_train, y_val, y_test = preprocess_data(dataset_path)
    
    # Load the trained model, specifying custom_objects for any custom functions like mse
    model_path = "../../saved_models/Auditory/audio_game_model.h5"
    model = tf.keras.models.load_model(model_path, custom_objects={"mse": mse})
    
    # Evaluate the model
    results = model.evaluate(X_test, y_test, verbose=1)
    print(f"Test Results: {results}")
    
    # Calculate Mean Absolute Error for regression
    predictions = model.predict(X_test)
    
    # For regression, directly compare predictions and true values
    mae = tf.keras.losses.MeanAbsoluteError()
    test_mae = mae(y_test, predictions)
    
    print(f"Mean Absolute Error on Test Set: {test_mae.numpy()}")
