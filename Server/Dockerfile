# Use Node.js 20-slim for a stable, reasonably small production base
FROM --platform=linux/amd64 node:20-slim

# Install Chromium and its dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-freefont-ttf fonts-kacst fonts-symbola fonts-thai-tlwg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Puppeteer
# Use the installed Chromium instead of downloading a new one
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy the rest of the backend source code
COPY . .

# Expose the application port (matching the 5000 default)
EXPOSE 5000

# Use a non-root user for improved security
USER node

# Start the application
CMD ["npm", "start"]
