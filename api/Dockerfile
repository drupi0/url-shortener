FROM node:slim
WORKDIR /api
COPY package*.json ./

RUN npm ci
COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]