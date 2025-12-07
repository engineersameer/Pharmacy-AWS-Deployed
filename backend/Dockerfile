# Use Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all backend files
COPY . .

# Expose backend port
EXPOSE 5001

# Start the backend
# Note: Main file is server.js (check package.json)
CMD ["node", "server.js"]
