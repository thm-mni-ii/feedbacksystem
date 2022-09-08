FROM openjdk:18.0.2-slim

RUN apt-get update && apt-get -y install python3 python3-pip
RUN pip3 install requests

ADD build/install/fbs-core.api /usr/local/fbs-core.api

VOLUME /usr/local/fbs-core.api/markdown
VOLUME /usr/local/fbs-core.api/conf
VOLUME /upload-dir
EXPOSE 433

WORKDIR /usr/local/fbs-core.api/bin
ENV JAVA_OPTS=""
ENTRYPOINT ["./wsd"]
