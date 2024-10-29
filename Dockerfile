# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

# ARG NODE_VERSION=21.6.2
# FROM node:slim
FROM  --platform=linux/amd64 node:latest
# FROM node:21.7.3-alpine
# Use production node environment by default.
# ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json .

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
# RUN --mount=type=bind,source=package.json,target=package.json \
#     --mount=type=bind,source=package-lock.json,target=package-lock.json \
#     --mount=type=cache,target=/root/.npm \
#     npm ci --omit=dev
COPY . .

# ENV DATABASE_URL=postgresql://critikk:fadfafadfhNsanS@db:5432/mydatabase

# Run the application as a non-root user.
# USER node

# Copy the rest of the source files into the image.

RUN npm install
# RUN chmod +x /usr/src/app/start.sh
EXPOSE 8001
# RUN npm run build
RUN chmod +x /usr/src/app/start.sh

# Run the application.
CMD ["/bin/sh", "/usr/src/app/start.sh"]
