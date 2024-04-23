#API: Importing Packages
from flask import Flask, jsonify, request, abort
from flask_pymongo import PyMongo

app = Flask(__name__)
from flask_cors import CORS
CORS(app)

# MongoDB Configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/mydatabase"
mongo = PyMongo(app)

# # Initialize MongoDB users collection
mongo.db.users.insert_many([
    {'_id': 'F01', 'password': 'adminpass', 'role': 'manager'},
    {'_id': 'F02', 'password': 'adminpass', 'role': 'manager'},
    {'_id': 'F03', 'password': 'adminpass', 'role': 'manager'},
    {'_id': 'F04', 'password': 'adminpass', 'role': 'full'},
    {'_id': 'F05', 'password': 'adminpass', 'role': 'full'},
    {'_id': 'F06', 'password': 'adminpass', 'role': 'full'},
    {'_id': 'F07', 'password': 'adminpass', 'role': 'full'},
    {'_id': 'P01', 'password': 'adminpass', 'role': 'part'},
    {'_id': 'P02', 'password': 'adminpass', 'role': 'part'},
    {'_id': 'P03', 'password': 'adminpass', 'role': 'part'},
    {'_id': 'P04', 'password': 'adminpass', 'role': 'part'},
    {'_id': 'P05', 'password': 'adminpass', 'role': 'part'}
])

# Initialize MongoDB users collection
mongo.db.availability.insert_many([
    {'_id': 'F01', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]}, 
    {'_id': 'F02', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
    {'_id': 'F03', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
    {'_id': 'F04', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
    {'_id': 'F05', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
    {'_id': 'F06', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
    {'_id': 'F07', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
    {'_id': 'P01', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
    {'_id': 'P02', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
    {'_id': 'P03', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
    {'_id': 'P04', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
    {'_id': 'P05', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]}  
])

