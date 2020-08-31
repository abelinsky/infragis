FROM node:alpine


WORKDIR /usr/src/app
COPY package.json .
RUN npm install --only=prod
COPY . .
COPY ./scripts/wait-for-it.sh /usr/src/app/wait-for-it.sh

RUN apk add --no-cache bash

# CMD ["npm", "start"]