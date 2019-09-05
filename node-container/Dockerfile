FROM node:10

# Create app directory
WORKDIR /usr/src/app

ADD run.sh /usr/src/script/run.sh
RUN npm install -g mocha
RUN npm install -g typescript@
RUN npm install -g ts-node
RUN npm install -g typescript

CMD [ "node" ]