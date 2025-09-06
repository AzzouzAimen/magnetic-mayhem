# Use the official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
# This caches our dependencies, so npm install only runs when they change
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY src/ ./src/

# Expose the port the server will run on
EXPOSE 4001

# Command to run the application
CMD ["npm", "start"]
