# --- Stage 1: Build the React App ---
FROM node:20-alpine AS build

    WORKDIR /app
    
    # Copy package files and install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy the rest of the client source code
    COPY . .
    
    # --- IMPORTANT: Set the production API URL ---
    # When deployed, the client needs to know the public URL of your server.
    # We use an argument to pass this in during the build process.
    ARG VITE_API_URL
    ENV VITE_API_URL=${VITE_API_URL}
    
    # Build the static files
    RUN npm run build
    
    
    # --- Stage 2: Serve the Static Files with Nginx ---
    FROM nginx:1.23-alpine
    
    # Copy the built files from the 'build' stage
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # Expose the port Nginx runs on
    EXPOSE 80
    
    # The default Nginx command will start the server automatically
    CMD ["nginx", "-g", "daemon off;"]