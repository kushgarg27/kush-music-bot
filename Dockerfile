# Use Node.js 20 base image
FROM node:20

# Install Python and ffmpeg for yt-dlp
RUN apt-get update && apt-get install -y python3 ffmpeg

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Start the bot
CMD ["node", "index.js"]
