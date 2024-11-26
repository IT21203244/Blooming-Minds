from flask import Flask
from flask_cors import CORS
import logging
from routes.AuditoryLearning.record_routes import record_routes

# Flask app setup
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Configure logging for better debugging
logging.basicConfig(level=logging.DEBUG)

# Register Blueprints
app.register_blueprint(record_routes)

if __name__ == "__main__":
    app.run(port=5000)
