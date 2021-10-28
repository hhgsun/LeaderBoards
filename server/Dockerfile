FROM node:alpine

WORKDIR /app/server

COPY ./package.json ./

RUN npm install

COPY ./ ./

CMD ["npm","start"]
