FROM openjdk:10-jre
MAINTAINER Andrej Sajenko <Andrej.Sajenko@mni.thm.de>

RUN adduser -D -u 1000 -h /usr/local/ws checker

ADD bin     /usr/local/ws/bin
ADD lib     /usr/local/ws/bin
ADD http    /usr/local/ws/http

USER checker
VOLUME /data/ws/storage
EXPOSE 8080
WORKDIR /usr/local/ws/bin
ENTRYPOINT ["./wsd"]