from flask import request, jsonify, g
from utils.auth.jwt_helper import verify_token
from bson import ObjectId  # Ensure we import ObjectId
import logging

def token_required(f):
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            logging.error("Token is missing in the request.")
            return jsonify({"error": "Token is missing"}), 401
        
        # Extract token from "Bearer <token>" format
        token = token.split(" ")[1] if " " in token else token
        
        # Verify the token
        decoded_token = verify_token(token)
        if not decoded_token:
            logging.error("Invalid or expired token.")
            return jsonify({"error": "Invalid or expired token"}), 401
        
        # Extract and attach the user _id as ObjectId (not as string)
        try:
            g.user_id = decoded_token["user_id"]
        except Exception as e:
            logging.error(f"Error extracting user ID: {e}")
            return jsonify({"error": f"Invalid user ID format: {e}"}), 400
        
        logging.info(f"User authenticated successfully. User ID: {g.user_id}")
        return f(*args, **kwargs)
    
    wrapper.__name__ = f.__name__
    return wrapper
