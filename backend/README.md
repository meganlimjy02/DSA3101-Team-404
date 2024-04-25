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
│          ├── trial_synthetic_data
│          ├── .gitignore
│          └── README.md (current file)
          
   
```

## SRC folder 
[src](./src)

### synthetic_final_poisson.csv
[src/synthetic_final_poisson.csv](./src/synthetic_final_poisson.csv)

Data file in csv format used in Models.py

### Models.py
[src/Models.py](./src/Models.py)

Models.py is a Python file designed to automate staff scheduling by forecasting customer occupancy for a 1-week period and optimizing staff allocation. By leveraging on the Prophet Model and Python packages such as pyworkforce and gurobipy, this file generates optimized staff timetables weekly while considering factors such as staff availability, roles, and cost constraints.

### database_initialization.py
[src/database_initialization.py](./src/database_initialization.py)

database_initialization.py is a Python file developed to automate the process of populating a MongoDB database with initial data for users and availability.

### APIs.py
[src/APIs.py](./src/APIs.py)

APIs.py is a Python file that provides a RESTful API for managing staff, generating customer forecasts and staff timetables. It initializes Flask and MongoDB configurations, exposing endpoints to connect with frontend application.

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

This folder contains exploratory data analysis conducted using the raw data stored in the synthetic_final_poisson.csv file.

## tests folder
[tests](./tests)

This folder contains the evaluation of the Prophet model utilized in the Models.py Python file for forecasting the number of customers.

## trial_synthetic_data folder 
[trial_synthetic_data](./trial_synthetic_data)

This folder contains other versions of data files used during our modeling phase to assess the performance of the Prophet model in forecasting customers. 














