from flask import Flask, send_from_directory
from flask_cors import CORS
import os
import logging


# Flask app setup
app = Flask(__name__)

# Allow cross-origin requests
CORS(app)  

# Kinesthetic Imports
#from routes.KnestheticLearning.predict_routes import predict_routes 
#from routes.KnestheticLearning.LetterRoutes import LetterRoutes
#from routes.KnestheticLearning.SmileFileRoute import SmileFileRoute

#ReadWrite Learning
from routes.ReadWriteLearning.letter_routes import letter_routes

IDEAL_LETTERS_DIR = r"E:\BloomingMinds\ml-models\datasets\ideal_letters"
UPLOADED_LETTERS_DIR = r"E:\BloomingMinds\backend\uploaded_letters"
STATIC_IMAGES_DIR = r"E:\BloomingMinds\ml-models\datasets\static\images"

# Serve static files (images & videos)
@app.route('/static/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(STATIC_IMAGES_DIR, filename)

@app.route('/static/videos/<path:filename>')
def serve_video(filename):
    videos_directory = r"E:\BloomingMinds\ml-models\datasets\static\videos"
    return send_from_directory(videos_directory, filename)

# Serve ideal letter images
@app.route('/static/ideal_letters/lowercase/<path:filename>')
def serve_lowercase_ideal_letter(filename):
    lowercase_directory = r"E:\BloomingMinds\ml-models\datasets\ideal_letters\Lowercase"
    return send_from_directory(lowercase_directory, filename)

@app.route('/static/ideal_letters/uppercase/<path:filename>')
def serve_uppercase_ideal_letter(filename):
    uppercase_directory = r"E:\BloomingMinds\ml-models\datasets\ideal_letters\Uppercase"
    return send_from_directory(uppercase_directory, filename)

# Serve static images and videos for ideal letters
@app.route('/static/ideal_letters/static/images/<path:filename>')
def serve_pic_image(filename):
    images_dir = os.path.join(IDEAL_LETTERS_DIR, 'static', 'images')
    return send_from_directory(images_dir, filename)

@app.route('/static/ideal_letters/static/videos/<path:filename>')
def serve_pic_video(filename):
    videos_dir = os.path.join(IDEAL_LETTERS_DIR, 'static', 'videos')
    return send_from_directory(videos_dir, filename)

# Serve uploaded letters
@app.route('/uploaded_letters/<path:filename>')
def serve_uploaded_letter(filename):
    return send_from_directory(UPLOADED_LETTERS_DIR, filename)

#Visual Learning
#from routes.VisualLearning.color_matching_routes import color_matching_routes


# Apply CORS properly AFTER initializing app
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/auth/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Disable pymongo debug logs
logging.getLogger("pymongo").setLevel(logging.ERROR)

# Configure logging for better debugging
logging.basicConfig(level=logging.DEBUG)

app.config['SECRET_KEY'] = 'd563dd960b7a8a289688945ea423d1f8777b9907d36a9d614e7b29addf1743e9'
app.config['UPLOAD_FOLDER'] = 'uploads/audio'

# Ensure upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Register Blueprints KnestheticLearning
#CORS(predict_routes, origins="http://localhost:3000")
#CORS(LetterRoutes, origins="http://localhost:3000")
#CORS(SmileFileRoute, origins="http://localhost:3000")
#app.register_blueprint(predict_routes) 
#app.register_blueprint(LetterRoutes) 
#app.register_blueprint(SmileFileRoute)

# Register Blueprints for Read Write Learning
app.register_blueprint(letter_routes, url_prefix='/read_write_learning')

# Register Blueprints for Visual Learning
#app.register_blueprint(color_matching_routes, url_prefix='/visual_learning')


# Import routes AFTER initializing Flask app
from routes.AuditoryLearning.AudioBook.record_routes import record_routes
from routes.AuditoryLearning.Guiders.lesson_routes import lesson_routes
from routes.AuditoryLearning.AudioGame.audiogame_routes import audiogame_routes
from routes.AuditoryLearning.AudioBook.audiobook_route import insert_routes
from routes.auth.auth_routes import auth_routes

# Register Blueprints for Auditory Learning
CORS(record_routes, origins="http://localhost:3000")
app.register_blueprint(record_routes)
app.register_blueprint(lesson_routes, url_prefix="/api")
app.register_blueprint(insert_routes, url_prefix="/api")
app.register_blueprint(audiogame_routes, url_prefix="/api")
app.register_blueprint(auth_routes, url_prefix='/auth')



# Run the Flask app on port 5000
if __name__ == "__main__":
    app.run(port=5000, debug=True)
