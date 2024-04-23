# Specify the base image with the version of Node.js you're using
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the project files to the container
COPY . .

# Specify the port your app will run on
EXPOSE 3000

# Command to start the development server
CMD ["npm", "run", "dev"]
