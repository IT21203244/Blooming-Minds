# routes.py
from flask import Blueprint, request, jsonify
from utils.KnestheticLearning.LetterQuest.LetterUtils import insert_student,get_students,delete_student

LetterRoutes = Blueprint("routes", __name__)

@LetterRoutes.route("/addStudentRecord", methods=["POST"])
def add_student():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid input"}), 400
        student_id = insert_student(data)
        return jsonify({"message": "Student added successfully", "id": student_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@LetterRoutes.route("/getStudentRecords", methods=["GET"])
def get_students_records():
    try:
        students = get_students()
        return jsonify({"students": students}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@LetterRoutes.route("/deleteStudentRecord/<student_id>", methods=["DELETE"])
def delete_student_record(student_id):
    try:
        result = delete_student(student_id)
        if result:
            return jsonify({"message": "Student deleted successfully"}), 200
        else:
            return jsonify({"error": "Student not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500