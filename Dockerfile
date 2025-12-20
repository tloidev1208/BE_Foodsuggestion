FROM node:18-alpine

# cd vào BE
WORKDIR /app/BE

# copy package trước để cache
COPY BE/package*.json ./

RUN npm install

# copy toàn bộ BE
COPY BE .

EXPOSE 5000

CMD ["npm", "start"]
