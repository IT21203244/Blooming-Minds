import jwt
import datetime
import os
import logging
from flask import current_app

# Generate a JWT token
def generate_token(user_id):
    TOKEN_EXPIRY_DAYS = max(int(os.getenv("TOKEN_EXPIRY_DAYS", 1)), 1)

    # Convert ObjectId to string
    user_id_str = str(user_id)

    payload = {
        "user_id": user_id_str,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=TOKEN_EXPIRY_DAYS)
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    logging.info("JWT token generated successfully.")
    return token


# Verify a JWT token
def verify_token(token):
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        logging.info("JWT token successfully verified.")
        return payload
    except jwt.ExpiredSignatureError:
        logging.warning("JWT token has expired.")
        return None
    except jwt.InvalidTokenError as e:
        logging.error(f"Invalid JWT token: {e}")
        return None
