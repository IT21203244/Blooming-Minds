from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from utils.auth.jwt_helper import generate_token
import re

# MongoDB connection
client = MongoClient("mongodb+srv://blooming_minds:BsjsdM24@bloomingminds.n7ia1.mongodb.net/")
db = client["blooming_minds"]
users_collection = db["users"]

# Create Blueprint
auth_routes = Blueprint("auth_routes", __name__)

# Email validation helper function
def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email) is not None

@auth_routes.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Username, Email, and Password are required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 409

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    hashed_password = generate_password_hash(password)
    users_collection.insert_one({"username": username, "email": email, "password": hashed_password})
    return jsonify({"message": "User registered successfully"}), 201

# Sign In route
@auth_routes.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and Password are required"}), 400

    user = users_collection.find_one({"username": username})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(user["_id"])
    return jsonify({
        "message": "Login successful",
        "token": token,
        "userId": str(user["_id"]),  
        "username": user["username"],
        "email": user["email"]
    }), 200
