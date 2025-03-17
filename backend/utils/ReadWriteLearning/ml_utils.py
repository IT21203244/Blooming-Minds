import os
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image, ImageOps
from scipy.optimize import curve_fit
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
import math  # Import math for rounding up

# Use absolute path to model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'new_model_hand_l.keras')
# Ensure the path is absolute
MODEL_PATH = os.path.abspath(MODEL_PATH)

# Check if the model file exists at the given path
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"The model file was not found at the specified path: {MODEL_PATH}")

model = load_model(MODEL_PATH)

# Label mapping (uppercase and lowercase letters)
word_dict = {i: chr(i + 65) for i in range(26)}
word_dict.update({i + 26: chr(i + 97) for i in range(26)})

def preprocess_image(image):
    image = image.resize((28, 28))
    image = ImageOps.grayscale(image)
    
    # Invert the image (invert the pixel values)
    image = ImageOps.invert(image)
    
    img_array = np.array(image) / 255.0  # Normalize the image
    img_array = img_array.reshape(1, 28, 28, 1)  # Reshape for model input
    return img_array

def predict_letter(image):
    try:
        img_array = preprocess_image(image)
        prediction = model.predict(img_array)
        predicted_class = np.argmax(prediction, axis=1)[0]
        return word_dict[predicted_class]
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return None

def calculate_pixel_accuracy(user_image, ideal_image):
    user_image = ImageOps.grayscale(user_image).resize((28, 28))
    ideal_image = ImageOps.grayscale(ideal_image).resize((28, 28))
    user_array = np.array(user_image)
    ideal_array = np.array(ideal_image)
    matching_pixels = np.sum(user_array == ideal_array)
    return (matching_pixels / ideal_array.size) * 100

def plot_learning_curve(attempts, accuracy, k, t0, save_path=None, confidence_interval=None):
    """
    Plot the learning curve and the fitted logistic growth model with confidence intervals.
    """
    plt.figure()
    plt.scatter(attempts, accuracy, label="Actual Data")
    x_values = np.linspace(min(attempts), max(attempts) + 10, 100)
    y_values = logistic_growth(x_values, k, t0)
    plt.plot(x_values, y_values, label="Logistic Fit", color="red")
    
    if confidence_interval:
        plt.fill_between(x_values, y_values - confidence_interval, y_values + confidence_interval, color='red', alpha=0.2, label="Confidence Interval")
    
    plt.axhline(95, color="green", linestyle="--", label="95% Accuracy")
    plt.xlabel("Attempts")
    plt.ylabel("Accuracy (%)")
    plt.legend()
    plt.title("Learning Curve and Logistic Growth Model")
    
    if save_path:
        plt.savefig(save_path)
        plt.close()
    else:
        plt.show()

def logistic_growth(t, k, t0):
    """Logistic growth function."""
    return 100 / (1 + np.exp(-k * (t - t0)))

def predict_attempts_to_95(attempts, accuracy, avg_time_per_attempt, plot_save_dir, additional_features=None):
    """
    Predict the number of attempts and time required to reach 95% accuracy
    using a logistic growth model with confidence intervals.
    """
    try:
        # Ensure there are at least 3 data points for curve fitting
        if len(attempts) < 3:
            return None, None, None, None

        # If accuracy is already above 95%, return 0 attempts
        if accuracy[-1] >= 95:
            return 0, 0, None, "You have already achieved 95% accuracy. Great job!"

        # Fit the logistic curve to the data
        params, _ = curve_fit(
            logistic_growth,
            attempts,
            accuracy,
            p0=[0.5, 3],  # Initial guesses for k and t0
            maxfev=5000,  # Increase maxfev to allow more iterations
            bounds=([0, 0], [10, 100]))  # Add bounds for k and t0
        k, t0 = params

        # Calculate confidence intervals
        residuals = accuracy - logistic_growth(attempts, *params)
        ss_res = np.sum(residuals**2)
        ss_tot = np.sum((accuracy - np.mean(accuracy))**2)
        r_squared = 1 - (ss_res / ss_tot)
        confidence_interval = 1.96 * np.std(residuals)  # 95% confidence interval

        # Print fitted parameters for debugging
        print(f"Learning rate (k): {k}, Inflection point (t0): {t0}, R-squared: {r_squared}")

        # Plot the learning curve and save it
        plot_path = os.path.join(plot_save_dir, "learning_curve_plot.png")
        plot_learning_curve(attempts, accuracy, k, t0, save_path=plot_path, confidence_interval=confidence_interval)

        # Solve for attempts when accuracy = 95%
        from scipy.optimize import fsolve
        target_accuracy = 95
        solve_attempts = fsolve(lambda t: logistic_growth(t, k, t0) - target_accuracy, x0=10)
        remaining_attempts = max(0, solve_attempts[0] - attempts[-1])

        # Estimate time required
        estimated_days = remaining_attempts * avg_time_per_attempt

        # Round up to the nearest integer for attempts and days
        remaining_attempts_rounded = math.ceil(remaining_attempts)
        estimated_days_rounded = math.ceil(estimated_days)

        # Explanation for the prediction
        explanation = (
            f"Based on your current progress, it will take approximately {remaining_attempts_rounded} more attempts "
            f"and {estimated_days_rounded} days to reach 95% accuracy. This prediction is based on a logistic growth model "
            f"fitted to your historical data with an R-squared value of {r_squared:.2f}, indicating a good fit."
        )

        return remaining_attempts_rounded, estimated_days_rounded, plot_path, explanation
    except Exception as e:
        print(f"Learning curve prediction error: {str(e)}")
        # Return default values if curve fitting fails
        return None, None, None, "Unable to generate a prediction due to insufficient data or an error in the model."