# Use an official Node runtime as the base image
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --prefix ./server
RUN npm ci --prefix ./client

# Copy source code
COPY . .

# Build the application
RUN npm run build --prefix ./server

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start", "--prefix", "./server"]