FROM node:alpine AS BUILD
COPY . /app
WORKDIR /app

RUN npm ci
RUN npm run build --prod

FROM nginx:alpine
COPY --from=BUILD /app/dist/link-shortener /usr/share/nginx/html 
COPY nginx.conf /etc/nginx/conf.d/default.conf