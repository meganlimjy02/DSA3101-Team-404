# DSA3101 Team 404 - Manpower Optimization in F&B Sector

## ABOUT
This repository is intended for the members in DSA3101 Team 404. 
In collaboration with Mount Faber Leisure Group (MFLG), this project seeks to minimize costs according to customer demand while optimizing manpower allocation for one of their restaurants, Good Old Days.

## SETUP
1. Fork the repository:
Click on the 'Fork' button at the top right corner of the repository's GitHub page to create a copy of the repository in your own GitHub account.

2. Clone your forked repository: Make sure to replace YOUR_GITHUB_USERNAME with your username in this command
   ```
   git clone https://github.com/YOUR_GITHUB_USERNAME/DSA3101-Team-404.git
   ```
3. Navigate to directory with docker-compose.yml
   ```
   cd DSA3101-Team-404/backend/src
   ```
4. Ensure that your device has Docker Desktop installed.<br />
<ins>Installing Docker Desktop</ins> <br />
Docker Desktop is the Community Edition (CE) of Docker. It is a powerful tool for building, sharing, and running containerized applications seamlessly across different environments. To download Docker Desktop head to Docker Hub.<br />

&emsp;&emsp;Link for Windows: https://www.docker.com/products/docker-desktop <br />
&emsp;&emsp;Link for Macbook: https://docs.docker.com/desktop/install/mac-install/


5. Run the yml file by typing in the following command
   ```
   docker-compose up
   ```
   This command will build images for the frontend and flask-app services using their respective Docker files, and also creates and runs docker containers for the services frontend, flask(backend) and the mongodb(database)
6. 
