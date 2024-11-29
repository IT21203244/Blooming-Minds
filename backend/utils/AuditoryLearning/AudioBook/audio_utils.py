import os
import wave
import logging
import pyaudio

# Audio recording settings
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024
RECORD_SECONDS = 5  # Duration of recording
OUTPUT_DIR = "recordings"
OUTPUT_FILENAME = "recorded_audio.wav"


def record_audio():
    """
    Record audio from the microphone and save it as a WAV file in Linear PCM format.
    """
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)
    audio = pyaudio.PyAudio()

    logging.info("Recording... Speak now!")
    stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE,
                        input=True, frames_per_buffer=CHUNK)

    frames = []

    for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)

    logging.info("Recording finished.")

    # Stop and close the stream
    stream.stop_stream()
    stream.close()
    audio.terminate()

    try:
        # Save the audio file
        with wave.open(output_path, "wb") as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(audio.get_sample_size(FORMAT))
            wf.setframerate(RATE)
            wf.writeframes(b"".join(frames))
        logging.info(f"Audio saved to {output_path}")
    except Exception as e:
        logging.error(f"Error saving audio: {e}")
        return None

    return output_path
