FROM node:11

# Create app directory
WORKDIR /usr/src/app
VOLUME /usr/src/results

ADD run.sh /usr/src/script/run.sh
RUN npm install -g mocha
RUN npm install -g typescript

CMD [ "node" ]