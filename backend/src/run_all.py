import os

# Get a list of all Python files in the directory
python_files = [file for file in os.listdir() if file.endswith('.py')]

# Execute each Python file
for file in python_files:
    os.system(f'python3 {file}')