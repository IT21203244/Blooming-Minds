from flask import Flask
from flask_cors import CORS
import logging
# Kinesthetic Imports
from routes.KnestheticLearning.predict_routes import predict_routes 
from routes.KnestheticLearning.LetterRoutes import LetterRoutes
from routes.KnestheticLearning.SmileFileRoute import SmileFileRoute

#Auditory Learning
#from routes.AuditoryLearning.AudioBook.record_routes import record_routes
#from routes.AuditoryLearning.AudioBook.lesson_routes import lesson_routes
#from routes.AuditoryLearning.AudioGame.audiogame_routes import audiogame_routes

#ReadWrite Learning
#from routes.ReadWriteLearning.letter_routes import letter_routes

#Visual Learning
#from routes.VisualLearning.color_matching_routes import color_matching_routes

#Auth 
from routes.auth.auth_routes import auth_routes

# Flask app setup
app = Flask(__name__)

# CORS setup to allow requests from React frontend at http://localhost:3000
CORS(app)

# Configure logging for better debugging
logging.basicConfig(level=logging.DEBUG)

app.config['SECRET_KEY'] = 'd563dd960b7a8a289688945ea423d1f8777b9907d36a9d614e7b29addf1743e9'

# Register Blueprints
# Register Blueprints KnestheticLearning
app.register_blueprint(predict_routes) 
app.register_blueprint(LetterRoutes) 
app.register_blueprint(SmileFileRoute)
#app.register_blueprint(record_routes)

#app.register_blueprint(lesson_routes, url_prefix="/api")
#app.register_blueprint(audiogame_routes, url_prefix="/api")

#app.register_blueprint(letter_routes, url_prefix='/read_write_learning')

#app.register_blueprint(color_matching_routes, url_prefix='/visual_learning')

app.register_blueprint(auth_routes, url_prefix='/auth')

# Run the Flask app on port 5000
if __name__ == "__main__":
    app.run(port=5000)
