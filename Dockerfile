FROM node:18-alpine

WORKDIR /app

# copy package trước để cache
COPY package*.json ./

RUN npm install

# copy toàn bộ source
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
