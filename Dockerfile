# Backend Dockerfile for NestJS
FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy Prisma schema first and generate client
COPY prisma ./prisma/
RUN #npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose port
EXPOSE 4000

# Use development start command
CMD ["npm", "run", "start:dev"]
