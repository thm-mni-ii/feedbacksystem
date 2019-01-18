FROM openjdk:10-jre
MAINTAINER Andrej Sajenko <Andrej.Sajenko@mni.thm.de>

ADD build/install/ws /usr/local/ws
ADD src/main/resources/init.sql /usr/local/ws

VOLUME /upload-dir
VOLUME /zip-dir
EXPOSE 8080
WORKDIR /usr/local/ws/bin
ENTRYPOINT ["./wsd"]
