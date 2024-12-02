# utils.py
from pymongo import MongoClient
from config import MONGO_URI, DATABASE_NAME, COLLECTION_NAME
from bson import ObjectId

def get_database():
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    return db

def insert_student(data):
    db = get_database()
    collection = db[COLLECTION_NAME]
    result = collection.insert_one(data)
    return str(result.inserted_id)

def get_students():
    db = get_database()
    collection = db[COLLECTION_NAME]
    students = list(collection.find({}))  # Retrieve all records
    for student in students:
        student["_id"] = str(student["_id"])  # Convert ObjectId to string
    return students

def delete_student(student_id):
    db = get_database()
    collection = db[COLLECTION_NAME]
    
    # Convert the student_id string to ObjectId
    try:
        student_object_id = ObjectId(student_id)
    except Exception as e:
        return False  # Invalid ObjectId, return False
    
    result = collection.delete_one({"_id": student_object_id})
    return result.deleted_count > 0  # Return True if deleted, otherwise False