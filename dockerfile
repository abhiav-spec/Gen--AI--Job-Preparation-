FROM node:20-alpine as Frontend-builder

COPY client /app

WORKDIR /app

RUN npm install

RUN npm run build

FROM node:20-alpine

# Install Chromium and dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# Tell Puppeteer to skip installing Chrome safely (we'll use the one installed via apk)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY ./Server /app

WORKDIR /app

RUN npm install

COPY --from=Frontend-builder /app/dist /app/public


CMD ["npm", "start"]