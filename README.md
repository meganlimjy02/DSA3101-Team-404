# DSA3101 Team 404 - Manpower Optimization in F&B Sector

## ABOUT
This repository is intended for the members in DSA3101 Team 404. 
In collaboration with Mount Faber Leisure Group (MFLG), this project seeks to minimize costs according to customer demand while optimizing manpower allocation for one of their restaurants, Good Old Days.

## Workflow
![Workflow](https://github.com/meganlimjy02/DSA3101-Team-404/assets/156317152/e75a91e1-bca0-42dd-87c2-998e3406968d)

## SETUP
1. Fork the repository:
Click on the 'Fork' button at the top right corner of the repository's GitHub page to create a copy of the repository in your own GitHub account.

2. Clone your forked repository: Make sure to replace YOUR_GITHUB_USERNAME with your username in this command
   ```
   git clone https://github.com/YOUR_GITHUB_USERNAME/DSA3101-Team-404.git
   ```
3. Navigate to directory with docker-compose.yml
   ```
   cd DSA3101-Team-404
   ```
4. Ensure that your device has Docker Desktop installed <br />
<ins>Installing Docker Desktop</ins> <br />
Docker Desktop is the Community Edition (CE) of Docker. It is a powerful tool for building, sharing, and running containerized applications seamlessly across different environments. To download Docker Desktop head to Docker Hub.<br />

&emsp;&emsp;Link for Windows: https://www.docker.com/products/docker-desktop <br />
&emsp;&emsp;Link for Macbook: https://docs.docker.com/desktop/install/mac-install/


5. Run the yml file using the following command
   ```
   docker-compose up
   ```
   This command will build images for the frontend and flask-app services using their respective Docker files, and also creates and runs docker containers for the services frontend, flask(backend) and the mongodb(database).
   
   In the future, you will only need to run the containers created in Docker Desktop to access the services.
7. Navigate to Server<br />
   Open up URL app is running on (this should appear when you run the above command). Navigate to http://localhost:3000/login to see the login page. <br />
   
   **OR**
   
   Open Docker Desktop (you should see the containers when you run the above command). Navigate to **3000:3000** as shown in the pictures below (highlighted in red). <br />
    <ins> Docker Desktop: Windows </ins>
  ![Windows Containers_e](https://github.com/meganlimjy02/DSA3101-Team-404/assets/156317152/8ceb70ba-f281-4c31-af76-1de0bcfe0a85)


   <ins> Docker Desktop: Macbook </ins>
![Macbook Containers_e](https://github.com/meganlimjy02/DSA3101-Team-404/assets/156317152/fde641c5-0054-411d-af76-62530a6d3a6b)

   
