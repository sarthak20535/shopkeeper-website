FROM node:20-slim

WORKDIR /app

COPY package.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm run install:all

COPY server ./server
COPY client ./client

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]
