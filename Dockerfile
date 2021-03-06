# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 8081
CMD [ "node", "server.js" ]