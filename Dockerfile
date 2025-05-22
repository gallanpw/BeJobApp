# 1) Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Production stage
FROM node:18-alpine
WORKDIR /app

# Install hanya production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy hasil build
COPY --from=builder /app/dist ./dist

# Expose dan jalankan
EXPOSE 8080
CMD ["node", "dist/index.js"]
