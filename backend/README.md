# Backend  

## Structure for backend
```


├── backend 
│         ├──src
│             ├── synthetic_final_poisson.csv
│             ├── Models.py
│             ├── database_initialization.py
│             ├── APIs.py
│             ├── Dockerfile
│             └── run_all.py
│             
│ 
│
│          ├── EDA
│          ├── tests
│          └── trial_synthetic_data
          
   
```

## SRC folder 
[src](./src)

### synthetic_final_poisson.csv
[src/synthetic_final_poisson.csv](./src/synthetic_final_poisson.csv)

Data file in csv format used in Models.py

### Models.py
[src/Models.py](./src/Models.py)

Models.py is a Python file designed to automate staff scheduling by forecasting customer occupancy for a 1-week period and optimizing staff allocation.By leveraging time series forecasting techniques with Prophet and optimization algorithms with gurobipy, this python file generates optimized staff timetables weekly while considering factors such as staff availability, roles, and cost constraints.

### database_initialization.py
[src/database_initialization.py](./src/database_initialization.py)

database_initialization.py is a Python file developed to automate the process of populating a MongoDB database with initial data.The file inserts data for users, including their IDs, passwords, and roles, as well as staff availability for various shifts. By executing this file, users can quickly set up their MongoDB database with essential data for staff management and scheduling. 

### APIs.py
[src/APIs.py](./src/APIs.py)
```
from flask import Flask, jsonify, request, abort
from flask_pymongo import PyMongo
from Models import generate_forecast, generate_timetable

app = Flask(__name__)
from flask_cors import CORS
CORS(app)

# MongoDB Configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/mydatabase"
mongo = PyMongo(app)

#API: Login
@app.route('/login', methods=['POST'])
def login():
    ...
#API: Staff Management
@app.route('/staff', methods=['POST'])
def add_staff():
    ...

@app.route('/staff/<staff_id>', methods=['DELETE'])
def remove_staff(staff_id):
    ...

#API: Staff Availibility
@app.route('/availability', methods=['GET', 'PUT'])
def manage_availability():
    ...
@app.route('/availability/<staff_id>', methods=['GET'])
def get_user_availability(staff_id):
    ...

#API: Customer Occupancy Forecast
@app.route('/forecast', methods=['POST'])
def forecast():
    ...

#API: Timetable Allocation
@app.route('/timetable', methods=['POST'])
def timetable():
    ...
if __name__ == '__main__':
    app.run(port=5000)
```

APIs.py is a Flask-based Python script that provides a RESTful API for managing staff, generating customer forecasts and staff timetables. It initializes Flask and MongoDB configurations, exposing endpoints for user login, staff management, staff availability, customer occupancy forecasting, and timetable allocation. It's used for integrating staff management and scheduling functionalities with MongoDB databases. This API is designed to seamlessly connect with front-end application,facilitating the development of website.


### Backend Dockerfile 
[src/Dockerfile](./src/Dockerfile)
```
FROM python:3.9

WORKDIR /app

COPY . .

RUN pip install pandas prophet matplotlib numpy pyworkforce pymongo
RUN pip install gurobipy requests bs4 flask flask_pymongo flask_cors
EXPOSE 5000

CMD ["python3", "run_all.py"]

```
This Dockerfile sets up a Python 3.9 environment. It starts by setting the working directory to /app within the docker container and copies the Models.py, database_initialization.py, synthetic_final_poisson.csv and APIs.py files into it. Then, it installs necessary Python packages using pip to run these files. Port 5000 is exposed to allow external access to the application. Finally, the container is instructed to run the run_all.py python file when started.

### run_all.py
[src/run_all.py](./src/run_all.py)

The Python script, used in conjunction with the Dockerfile, contains code designed to execute all Python files under the ‘backend/src’ directory simultaneously.

## EDA folder
[EDA](./EDA)

This folder contains preliminary data analysis conducted using the raw data stored in the synthetic_final_poisson.csv file.

## tests folder
[tests](./tests)

This folder contains the evaluation of the Prophet model utilized in the Models.py Python file for forecasting the number of customers.

## trial_synthetic_data folder 
[trial_synthetic_data](./trial_synthetic_data)

This folder contains all the data files used from the beginning of our modeling phase to assess the performance of the Prophet model in forecasting customers, within the Models.py Python file. This enables us to select the data file with the best performance for further use.














