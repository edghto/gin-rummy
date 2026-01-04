FROM node:24.12.0 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli

COPY . .

RUN ng build --configuration=production

FROM 1.29.4-alpine-slim

COPY --from=build app/dist/gin-rummy-fe /usr/share/nginx/html
