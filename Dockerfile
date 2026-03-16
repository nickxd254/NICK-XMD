# Use a newer, more stable version of Node
FROM node:18-bullseye

# Fix for Exit Code 100: Use a more robust update and retry logic
RUN apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    imagemagick \
    webp \
    git \
    python3 \
    build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files first
COPY package.json .

# Install dependencies (using --force if needed to avoid build hangs)
RUN npm install

# Copy everything else
COPY . .

# Match your index.js port
EXPOSE 4420

# Start the bot
CMD ["node", "index.js"]
