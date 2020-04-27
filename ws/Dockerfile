FROM openjdk:10-jre
MAINTAINER Andrej Sajenko <Andrej.Sajenko@mni.thm.de>

ADD build/install/ws /usr/local/ws
ADD src/main/resources/init.sql /usr/local/ws
COPY bbb_scripts/ /bin/
VOLUME /usr/local/ws/markdown
VOLUME /usr/local/ws/conf
VOLUME /upload-dir
VOLUME /shared-messages
EXPOSE 8080
RUN apt-get update && apt-get -y install python3 apt-transport-https
RUN apt-get -y install software-properties-common
RUN add-apt-repository "deb http://archive.ubuntu.com/ubuntu $(lsb_release -sc) universe"
RUN apt-get -y update
RUN apt-get -y install python-pip
RUN pip install requests
WORKDIR /usr/local/ws/bin
ENV JAVA_OPTS=""
ENV BBB_SECRET=YVXodgCkymuGAUHBAspiwXq8BjUebwLrvwr3D5AP0
ENTRYPOINT ["./wsd"]
