# Use Node 20 base image
FROM node:20

# Install python3 and make sure `python` command is available
RUN apt-get update && \
    apt-get install -y python3 ffmpeg && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the files
COPY . .

# Expose web port (optional for Railway)
EXPOSE 3000

# Run the bot
CMD ["node", "index.js"]
