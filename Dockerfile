FROM node:lts-buster

# Use a mirror and clear cache to avoid Exit Code 100
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    imagemagick \
    webp \
    git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files first (better for caching)
COPY package.json .
RUN npm install

# Copy the rest of your code
COPY . .

# Expose the port (Make sure this matches your config)
EXPOSE 4420

# Startup command
CMD ["node", "index.js"]
