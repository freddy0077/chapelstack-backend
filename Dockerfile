# Backend Dockerfile for NestJS
FROM node:20-alpine

# Install OpenSSL for Prisma and pnpm
RUN apk add --no-cache openssl
RUN npm install -g pnpm

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy Prisma schema first and generate client
COPY prisma ./prisma/
RUN pnpx prisma generate

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 4000

# Use production start command
CMD ["pnpm", "run", "start:prod"]
