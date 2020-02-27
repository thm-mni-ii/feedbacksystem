FROM openjdk:10-jre
MAINTAINER Andrej Sajenko <Andrej.Sajenko@mni.thm.de>

ADD build/install/ws /usr/local/ws
ADD src/main/resources/init.sql /usr/local/ws
VOLUME /usr/local/appconfig/markdown
VOLUME /usr/local/appconfig/application.properties
VOLUME /upload-dir
VOLUME /shared-messages
EXPOSE 8080
WORKDIR /usr/local/ws/bin
ENV JAVA_OPTS=""
ENTRYPOINT ["./wsd"]
