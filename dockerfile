FROM node:20-alpine as Frontend-builder

COPY client /app

WORKDIR /app

RUN npm install

RUN npm run build

FROM node:20-alpine

COPY ./Server /app

WORKDIR /app

RUN npm install

COPY --from=Frontend-builder /app/dist /app/public


CMD ["npm", "start"]