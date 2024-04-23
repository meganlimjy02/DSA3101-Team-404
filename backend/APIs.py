#API: Importing Packages
from flask import Flask, jsonify, request, abort
from flask_pymongo import PyMongo
from Models import generate_forecast, generate_timetable

app = Flask(__name__)
from flask_cors import CORS
CORS(app)

# MongoDB Configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/mydatabase"
mongo = PyMongo(app)

# # Initialize MongoDB users collection
# mongo.db.users.insert_many([
#     {'_id': 'F01', 'password': 'adminpass', 'role': 'manager'},
#     {'_id': 'F02', 'password': 'adminpass', 'role': 'manager'},
#     {'_id': 'F03', 'password': 'adminpass', 'role': 'manager'},
#     {'_id': 'F04', 'password': 'adminpass', 'role': 'full'},
#     {'_id': 'F05', 'password': 'adminpass', 'role': 'full'},
#     {'_id': 'F06', 'password': 'adminpass', 'role': 'full'},
#     {'_id': 'F07', 'password': 'adminpass', 'role': 'full'},
#     {'_id': 'P01', 'password': 'adminpass', 'role': 'part'},
#     {'_id': 'P02', 'password': 'adminpass', 'role': 'part'},
#     {'_id': 'P03', 'password': 'adminpass', 'role': 'part'},
#     {'_id': 'P04', 'password': 'adminpass', 'role': 'part'},
#     {'_id': 'P05', 'password': 'adminpass', 'role': 'part'}
# ])

# # Initialize MongoDB users collection
# mongo.db.availability.insert_many([
#     {'_id': 'F01', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]}, 
#     {'_id': 'F02', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'F03', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'F04', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'F05', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'F06', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'F07', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'P01', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'P02', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'P03', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'P04', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'P05', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]}  
# ])


#API: Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = mongo.db.users.find_one({"_id": username, "password": password})
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    return jsonify({'message': 'Login successful', 'role': user['role']})

#API: Staff Management
@app.route('/staff', methods=['POST'])
def add_staff():
    if request.headers.get('Role') != 'manager':
        abort(403)
    data = request.get_json()
    mongo.db.users.update_one({"_id": data['_id']}, {"$set": data}, upsert=True)
    return jsonify({'message': 'Staff added'})

@app.route('/staff/<staff_id>', methods=['DELETE'])
def remove_staff(staff_id):
    if request.headers.get('Role') != 'manager':
        abort(403)
    result = mongo.db.users.delete_one({"_id": staff_id})
    if result.deleted_count:
        return jsonify({'message': 'Staff removed'})
    else:
        return jsonify({'message': 'Staff not found'}), 404

#API: Staff Availibility
@app.route('/availability', methods=['GET', 'PUT'])
def manage_availability():
    if request.method == 'GET':
        availability = list(mongo.db.availability.find())
        return jsonify(availability)
    elif request.method == 'PUT':
        data = request.get_json()
        result = mongo.db.availability.update_one({"_id": data['_id']}, {"$set": {"availability": data['availability']}}, upsert=True)
        return jsonify({'message': 'Availability updated'})
    
@app.route('/availability/<staff_id>', methods=['GET'])
def get_user_availability(staff_id):
    return jsonify(mongo.db.availability.find_one({"_id": staff_id}))

#API: Customer Occupancy Forecast
@app.route('/forecast', methods=['POST'])
def forecast():
    data = request.get_json()
    start_date = data['start_date']
    forecast_data = generate_forecast(start_date)
    return jsonify(forecast_data.to_dict(orient='records'))

#API: Timetable Allocation
@app.route('/timetable', methods=['POST'])
def timetable():
    data = request.get_json()
    start_date = data['start_date']
    dashboard, total_cost = generate_timetable(start_date)
    return jsonify({
        'timetable': dashboard.to_dict(orient='index'),
        'total_cost': total_cost
    })

# 'timetable' becomes a dictionary of dictionaries. Every key is a person, and the value is another dict, with keys as each shift and value of 1 or 0. 
# {'EE01': {'Monday1': -0.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': 1.0, 'Wednesday1': -0.0, 'Wednesday2': 1.0, 'Thursday1': 1.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': -0.0, 'Saturday1': 1.0, 'Saturday2': -0.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
#  'EE02': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 0.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': 1.0, 'Thursday1': 0.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': -0.0, 'Saturday2': 1.0, 'Sunday1': 1.0, 'Sunday2': -0.0}, 
#  'EE03': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': -0.0, 'Wednesday1': 0.0, 'Wednesday2': 1.0, 'Thursday1': 1.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': -0.0, 'Saturday2': 1.0, 'Sunday1': -0.0, 'Sunday2': 1.0}, 
#  'EE04': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': -0.0, 'Thursday1': 1.0, 'Thursday2': -0.0, 'Friday1': 1.0, 'Friday2': -0.0, 'Saturday1': 0.0, 'Saturday2': 1.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
#  'EE05': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 0.0, 'Tuesday2': 1.0, 'Wednesday1': -0.0, 'Wednesday2': -0.0, 'Thursday1': 1.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': 0.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
#  'EE06': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': -0.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': 1.0, 'Thursday1': -0.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': 1.0, 'Sunday1': -0.0, 'Sunday2': -0.0}, 
#  'EE07': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 0.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': -0.0, 'Thursday1': 1.0, 'Thursday2': -0.0, 'Friday1': -0.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': 1.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
#  'EE08': {'Monday1': -0.0, 'Monday2': -0.0, 'Tuesday1': 1.0, 'Tuesday2': -0.0, 'Wednesday1': 1.0, 'Wednesday2': 1.0, 'Thursday1': 0.0, 'Thursday2': 1.0, 'Friday1': -0.0, 'Friday2': -0.0, 'Saturday1': 1.0, 'Saturday2': 1.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
#  'EE09': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': -0.0, 'Tuesday2': -0.0, 'Wednesday1': 1.0, 'Wednesday2': -0.0, 'Thursday1': 1.0, 'Thursday2': -0.0, 'Friday1': -0.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': -0.0, 'Sunday1': 1.0, 'Sunday2': -0.0}, 
#  'EE10': {'Monday1': 0.0, 'Monday2': -0.0, 'Tuesday1': 1.0, 'Tuesday2': 0.0, 'Wednesday1': -0.0, 'Wednesday2': 1.0, 'Thursday1': -0.0, 'Thursday2': -0.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': 1.0, 'Sunday1': -0.0, 'Sunday2': 1.0}, 
#  'EE11': {'Monday1': -0.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': 1.0, 'Thursday1': -0.0, 'Thursday2': 1.0, 'Friday1': -0.0, 'Friday2': 1.0, 'Saturday1': -0.0, 'Saturday2': -0.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
#  'EE12': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': 1.0, 'Wednesday1': -0.0, 'Wednesday2': 1.0, 'Thursday1': 1.0, 'Thursday2': -0.0, 'Friday1': -0.0, 'Friday2': -0.0, 'Saturday1': -0.0, 'Saturday2': 1.0, 'Sunday1': -0.0, 'Sunday2': 1.0}}

# 'total_cost'
# '7125.0'

if __name__ == '__main__':
    app.run(port=5000)