FROM node:18-alpine

WORKDIR /app/server

COPY package*.json ./

# Install node packages, install serve, build the app, and remove dependencies at the end
RUN npm install 

COPY . .
