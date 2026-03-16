# Use Node 20 (LTS) which has built-in Web Crypto support
FROM node:20-bullseye

# Install system dependencies
RUN apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    imagemagick \
    webp \
    git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json .

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Match your port config
EXPOSE 4420

# Command to run the bot
CMD ["node", "index.js"]
