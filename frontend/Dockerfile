# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the Vite development port
EXPOSE 5173

# Start the development server, exposing it to the Docker network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]