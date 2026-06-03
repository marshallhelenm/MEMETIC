FROM node:22-alpine AS builder
WORKDIR /app
ARG VITE_WS_URL
ENV VITE_WS_URL=$VITE_WS_URL
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Production image ---
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Use Nginx template for Heroku $PORT compatibility
COPY default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]