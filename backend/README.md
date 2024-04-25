# Backend  

## Structure for backend
```


├── backend 
│         ├──src
│             ├── APIs.py
│             ├── Models.py
│             ├── database_initialization.py
│             ├── synthetic_final_poisson.csv
│             ├── Dockerfile
│             └── run_all.py
│             
│ 
│
│          ├── EDA
│          ├── tests
           └── trial_synthetic_data
          
   
```

## SRC folder 
[src](./src)

### synthetic_final_poisson.csv
[src/synthetic_final_poisson.csv](./src/synthetic_final_poisson.csv)

Data file in csv format used in Models.py

### Models.py
[src/Models.py](./src/Models.py)

model.py is a Python file designed to automate staff scheduling by forecasting customer occupancy for a 1-week period and optimizing staff allocation. Leveraging time series forecasting techniques with Prophet and optimization algorithms with gurobipy, this python file generates optimized staff timetables weekly while considering factors such as staff availability, roles, and cost constraints.

### database_initialization.py
[src/database_initialization.py](./src/database_initialization.py)

database_initialization.py is a Python file developed to automate the process of populating a MongoDB database with initial data.The file inserts data for users, including their IDs, passwords, and roles, as well as staff availability for various shifts. By executing this file, users can quickly set up their MongoDB database with essential data for staff management and scheduling. 

### APIs.py
[src/APIs.py](./src/APIs.py)

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
This Dockerfile sets up a Python 3.9 environment. It starts by setting the working directory to /app within the docker container and copies the Models.py,database_initialization.py, synthetic_final_poisson.csv and APIs.py into it. Then, it installs necessary Python packages using pip to run these files. Port 5000 is exposed to allow external access to the application. Finally, the container is instructed to run the run_all.py python file when started.

### run_all.py
[src/run_all.py](./src/run_all.py)

The Python script, used in conjunction with the Dockerfile, contains code designed to execute all Python files under the ‘backend/src’ directory simultaneously.

## EDA













