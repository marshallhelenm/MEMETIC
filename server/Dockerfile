FROM node:18-alpine AS builder
WORKDIR /app
# Copy server package files
COPY server/package.json server/package-lock.json ./
RUN npm ci
# Copy server source
COPY server/ ./
# Copy shared types
COPY shared/types/messages.ts ./types/messages.ts
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/server.js"]
