# --- Stage 1: Build the React App ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .


# We now hardcode a placeholder. The entrypoint script will replace this.
ENV VITE_API_URL=API_URL_PLACEHOLDER

# Build the static files
RUN npm run build


# --- Stage 2: Serve the Static Files with Nginx ---
FROM nginx:1.23-alpine

# Copy the built files from the 'build' stage
COPY --from=build /app/dist /usr/share/nginx/html

# --- NEW STEPS ---
# Copy the entrypoint script into the container
COPY entrypoint.sh /entrypoint.sh
# Make it executable inside the container (this is a backup if the git command fails)
RUN chmod +x /entrypoint.sh

# Tell the container to run our script first
ENTRYPOINT ["/entrypoint.sh"]

# Expose the port Nginx runs on
EXPOSE 80

# This is now the command that our entrypoint.sh will execute at the end
CMD ["nginx", "-g", "daemon off;"]