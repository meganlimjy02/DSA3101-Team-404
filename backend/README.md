# Docker 

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

YAML file contains three services: "frontend", "mongodb", and "flask-app".

## 








