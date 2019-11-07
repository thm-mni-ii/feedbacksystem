FROM node:11

# run this i.e. docker run -it feedbacksystem_nodeenv:latest   bash

# Create app directory
WORKDIR /usr/src/app
VOLUME /usr/src/results

ADD run.sh /usr/src/script/run.sh
ADD json.js /usr/src/script/json.js
RUN npm install -g mocha
RUN npm install -g typescript

# make JSON Reporter globally available
RUN cp /usr/src/script/json.js $(npm root -g)"/mocha/lib/reporters"

CMD [ "node" ]