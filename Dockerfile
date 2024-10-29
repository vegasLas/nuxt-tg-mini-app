# syntax=docker/dockerfile:1

FROM  --platform=linux/amd64 node:latest

WORKDIR /usr/src/app

COPY package*.json .

COPY . .
RUN npm install
EXPOSE 8001
RUN chmod +x /usr/src/app/start.sh

CMD ["/bin/sh", "/usr/src/app/start.sh"]
