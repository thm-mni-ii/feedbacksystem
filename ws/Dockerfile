FROM openjdk:14.0.1-slim
MAINTAINER Andrej Sajenko <Andrej.Sajenko@mni.thm.de>

ADD build/install/ws /usr/local/ws
ADD src/main/resources/init.sql /usr/local/ws
COPY bbb_scripts/ /bin/
VOLUME /usr/local/ws/markdown
VOLUME /usr/local/ws/conf
VOLUME /upload-dir
VOLUME /shared-messages
EXPOSE 8080
RUN apt-get update && apt-get -y install python3 \
    python3-pip
RUN pip3 install requests
WORKDIR /usr/local/ws/bin
ENV JAVA_OPTS=""
ENTRYPOINT ["./wsd"]
