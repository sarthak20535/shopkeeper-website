FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm run install:all

COPY server ./server
COPY client ./client

RUN npm run build

ENV NODE_ENV=production
ENV DATA_DIR=/data
ENV PORT=3001

RUN mkdir -p /data/uploads

EXPOSE 3001

CMD ["npm", "start"]
