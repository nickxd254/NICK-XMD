FROM node:lts-buster

# Install necessary dependencies
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files and install
COPY package.json .
RUN npm install

# Copy the rest of your code
COPY . .

# Expose the port Render expects
EXPOSE 4420

# The actual startup command
CMD ["node", "index.js"]
