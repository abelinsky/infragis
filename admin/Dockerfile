FROM node:alpine

WORKDIR /app
COPY package.json .
RUN npm install --only=prod
COPY . .

ENTRYPOINT ["npm"]

CMD ["npm", "start"]