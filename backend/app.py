from flask import Flask
from flask_cors import CORS
import logging
from routes.AuditoryLearning.AudioGame.record_routes import record_routes
from routes.AuditoryLearning.AudioGame.lesson_routes import lesson_routes

# Flask app setup
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Configure logging for better debugging
logging.basicConfig(level=logging.DEBUG)

# Register Blueprints
# Auditory Learning
app.register_blueprint(record_routes)
app.register_blueprint(lesson_routes, url_prefix="/api") 

# kinesthetic Learning

if __name__ == "__main__":
    app.run(port=5000)
