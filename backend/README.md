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
│             ├── docker-compose.yml
│             └── run_all.py
│
│          ├── EDA
│          ├── tests
           └── trial_synthetic_data
   
```
## Backend Dockerfile 
[src/Dockerfile](./src/Dockerfile)
```
FROM python:3.9

WORKDIR /app

COPY . .

RUN pip install pandas prophet matplotlib numpy pyworkforce pymongo
RUN pip install gurobipy requests bs4 flask flask_pymongo flask_cors 

CMD ["python3", "run_all.py"]

```
The docker file specifies the base image as Python version 3.9. Next, it sets the working directory inside the container to "/app", where the backend files in the src folder, APIs.py, Models.py, database_initialization.py, synthetic_final_poisson.csv will reside. 
The "COPY . ." comand in dockerfile copies all these files into the container's "/app" directory,ensuring files are within container."RUN pip install" downloads all python dependencies in the files APIs.py, Models.py, database_initialization.py, synthetic_final_poisson.csv.  The CMD command runs all those python files in the docker container.run_all.py file contains the python code to run APIs.py ,database_initialization.py and Models.py files simultaneously.




## yml file
[src/docker-compose.yml](./src/docker-compose.yml)

```
version: '3'
services:
  frontend:
    build:
      ...
    ports:
      - "3000:3000" 
      
  mongodb:
    image: mongo:latest
    ...

  flask-app:
    build:
      ...

volumes:
  mongodb_data:
    driver: local
```

YAML file contains three services: "frontend", "mongodb", and "flask-app". When the yml file is run, it creates a docker container each for the the frontend,mongodb(database),flask-app(backend).

## Docker compose 
Run the yml file with the docker compose command in the terminal:
```
docker compose up
```
## Output in backend docker container 
```
* Running on http://127.0.0.1:5000
Press CTRL+C to quit
Importing plotly failed. Interactive plots will not work.
This is a development server. Do not use it in a production deployment. Use a production WSGI server instead. 

```
The message indicates that API.py file is running in the docker container which is used to connect to the front end service. 











