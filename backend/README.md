Structure for backend
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








