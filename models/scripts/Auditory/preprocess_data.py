import pandas as pd
from sklearn.model_selection import train_test_split

def preprocess_data(file_path):
    # Load dataset
    data = pd.read_csv(file_path)
    
    # Ensure dataset consistency (drop missing or inconsistent data if needed)
    data = data.dropna()
    
    # Split dataset into features (X) and target (y)
    features = ['response_correctness', 'response_time', 'engagement_duration']  # Input variables
    target = 'session_score'  # Target variable
    
    X = data[features]
    y = data[target]
    
    # Split the data into training, validation, and test sets
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
    
    return X_train, X_val, X_test, y_train, y_val, y_test

if __name__ == "__main__":
    dataset_path = "../../datasets/Auditory/AudioGame_session_data.csv"
    X_train, X_val, X_test, y_train, y_val, y_test = preprocess_data(dataset_path)
    print("Data preprocessing completed successfully.")
