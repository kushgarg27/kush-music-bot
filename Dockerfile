# Use Node.js 20
FROM node:20

# Install dependencies: python3, ffmpeg for yt-dlp-exec
RUN apt-get update && \
    apt-get install -y python3 ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy only package.json and lock first for caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm instal
