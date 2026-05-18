FROM node:16
RUN npm install -g nodemon
WORKDIR /home/node/app
COPY package.json .
RUN npm i
EXPOSE 80
USER node