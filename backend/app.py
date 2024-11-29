from flask import Flask
from flask_cors import CORS
import logging
from routes.AuditoryLearning.record_routes import record_routes
# Kinesthetic Imports
from routes.KnestheticLearning.predict_routes import predict_routes  

# Flask app setup
app = Flask(__name__)

# CORS setup to allow requests from React frontend at http://localhost:3000
CORS(app, resources={r"/predict": {"origins": "http://localhost:3000"}})

# Configure logging for better debugging
logging.basicConfig(level=logging.DEBUG)

# Register Blueprints
app.register_blueprint(record_routes)  # Auditory Learning routes
app.register_blueprint(predict_routes)  # Kinesthetic Learning routes (smile prediction)

# Run the Flask app on port 5000
if __name__ == "__main__":
    app.run(port=5000)
