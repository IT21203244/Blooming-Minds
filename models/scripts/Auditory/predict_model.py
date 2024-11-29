import tensorflow as tf
import numpy as np

def predict_score(model_path, input_data):
    # Load the trained model
    model = tf.keras.models.load_model(model_path)
    
    # Predict the session score
    prediction = model.predict(np.array([input_data]))
    return prediction[0]

if __name__ == "__main__":
    # Example input data: [response_correctness, response_time, engagement_duration]
    input_data = [1, 5.5, 230]
    model_path = "../../saved_models/Auditory/audio_game_model.h5"
    
    predicted_score = predict_score(model_path, input_data)
    print(f"Predicted Session Score: {predicted_score}")

