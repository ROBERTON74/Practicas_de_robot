FROM node:18
WORKDIR /app
RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/jcsombria/ReNoLabs.git
RUN npm install -g pm2
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["pm2-runtime", "server.js"]
