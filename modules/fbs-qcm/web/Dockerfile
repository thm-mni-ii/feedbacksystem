FROM node:20-alpine

ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install 

COPY . .

ENV VITE_BASE_URL=/questionary/
RUN npm run build-only

CMD ["npm", "run", "preview"]