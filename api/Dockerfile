FROM node:14
WORKDIR /api
COPY ./api/package*.json ./

RUN npm ci
COPY ./api/ .

EXPOSE 8080

CMD [ "npm", "start" ]