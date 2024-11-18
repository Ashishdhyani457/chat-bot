# Use Node.js as the base image to build the app
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Build the Vite app for production
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:alpine

# Copy the build output from the first stage to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom Nginx config file (optional)
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
