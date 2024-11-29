import logging
import assemblyai as aai

# Set your AssemblyAI API key
aai.settings.api_key = "452681f6f1c44c9c9a25ebb89a59505b"

def transcribe_audio(file_path):
    """
    Transcribe the recorded audio using AssemblyAI.
    :param file_path: Path to the audio file
    :return: Transcribed text
    """
    transcriber = aai.Transcriber()

    try:
        logging.info("Starting transcription...")
        transcript = transcriber.transcribe(file_path)
        logging.info(f"Transcription successful: {transcript.text}")
        return transcript.text
    except Exception as e:
        logging.error(f"Error during transcription: {e}")
        return None
