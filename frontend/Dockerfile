# Stage 1: Build the Vite React app
FROM node:24-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Stage 2: Serve using Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
