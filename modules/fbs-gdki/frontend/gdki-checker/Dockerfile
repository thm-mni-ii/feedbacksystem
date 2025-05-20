FROM node:20-alpine

ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install 

COPY . .

ENV VITE_BASE_URL=/gdki-checker/
RUN npm run build

CMD ["npm", "run", "preview"]