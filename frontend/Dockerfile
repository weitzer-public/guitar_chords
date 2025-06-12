# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Bundle app source (including the public directory and server.js)
COPY . .

# Make port 8080 available
EXPOSE 8080
ENV PORT 8080
ENV HOST 0.0.0.0

# Run server.js when the container launches
CMD ["node", "server.js"]
