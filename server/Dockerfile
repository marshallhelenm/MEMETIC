FROM node:18-alpine AS builder
WORKDIR /app
# Copy server package files
COPY package.json package-lock.json ./
RUN npm ci
# Copy server source
COPY . ./
# Copy shared types (if needed, adjust path if types are outside server dir)
# COPY ../shared/types/messages.ts ./types/messages.ts
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/server.js"]
