FROM node:24-alpine

WORKDIR /app

ENV NG_CLI_ANALYTICS=false

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
