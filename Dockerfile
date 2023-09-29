# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Install Bun globally (you may want to specify a version)
RUN npm install -g bun

# Copy your Bun application files into the container
COPY . .

# Expose the port your Bun application listens on (if applicable)
EXPOSE 3000

# Define the command to start your Bun application
CMD ["bun", "start"]

