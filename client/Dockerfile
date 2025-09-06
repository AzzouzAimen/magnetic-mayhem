# --- Stage 1: Build the React App ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# We no longer set the ENV here. It will be provided by a file.
RUN npm run build


# --- Stage 2: Serve the Static Files with Nginx ---
FROM nginx:1.23-alpine

# Copy the built files from the 'build' stage
COPY --from=build /app/dist /usr/share/nginx/html

# We don't need the entrypoint script anymore
# Nginx will start automatically

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]