# Build the application 
FROM node:22-alpine AS build

# Set the working directory

WORKDIR /app

# Copy package files 

COPY package*.json ./

# install dependencies 
RUN npm ci

# Copy the rest of teh source code 

COPY . . 

# Build the front end 
RUN npm run build

# Serve the application using Nginx
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen ${PORT}; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/templates/default.conf.template

# COPY custom nginx configuration to listen on port 8080 (see step below)
EXPOSE 8080



CMD ["nginx", "-g", "daemon off;"]