# Build the application 
FROM node:22-alpine AS build

# Set the working directory

WORKDIR /app

# Copy package files 

COPY package*.json ./

# install dependencies 
RUN npm install

# Copy the rest of teh source code 

COPY . . 

# Build the front end 
RUN npm run build --prod

# Serve the application using Nginx
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]