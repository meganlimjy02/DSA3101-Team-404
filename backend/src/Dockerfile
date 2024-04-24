FROM python:3.9

# Set the working directory inside the container
WORKDIR /app

# Copy the Python script and any required files into the container
COPY . .

# Install Python dependencies
RUN pip install pandas prophet matplotlib numpy pyworkforce pymongo
RUN pip install gurobipy requests bs4 flask flask_pymongo flask_cors 


# Define the command to run your Python script
CMD ["python3", "run_all.py"]