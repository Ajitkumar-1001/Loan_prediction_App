# nginx/Dockerfile

FROM nginx:stable-alpine

# Copy custom nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built React frontend (adjust if it's /dist)
COPY ../frontend/build /usr/share/nginx/html

EXPOSE 80

# CMD ["nginx", "-g", "daemon off"]
