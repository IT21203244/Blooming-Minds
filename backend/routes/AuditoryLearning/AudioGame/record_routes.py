from flask import Blueprint, jsonify
import logging
from utils.AuditoryLearning.AudioBook.audio_utils import record_audio
from utils.AuditoryLearning.AudioBook.transcription_utils import transcribe_audio

record_routes = Blueprint("record_routes", __name__)

@record_routes.route('/record', methods=['POST'])
def record_and_transcribe():
    """
    API endpoint to record audio and return the transcription.
    """
    try:
        audio_file_path = record_audio()
        if not audio_file_path:
            return jsonify({"error": "Failed to record audio"}), 500

        transcription = transcribe_audio(audio_file_path)

        if transcription:
            return jsonify({"transcription": transcription}), 200
        else:
            return jsonify({"error": "Failed to transcribe audio"}), 500

    except Exception as e:
        logging.error(f"Error in /record route: {e}")
        return jsonify({"error": "Internal server error"}), 500
