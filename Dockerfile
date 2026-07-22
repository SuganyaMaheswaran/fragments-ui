# Use an official Node runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy the rest of the application code
COPY . .

# Cloud Run injects a PORT environment variable (defaults to 8080)
EXPOSE 8080

# Start the application using npm start or direct node execution
CMD ["npm", "start"]