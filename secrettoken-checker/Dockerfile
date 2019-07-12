FROM docker:dind
RUN apk update
RUN apk add --no-cache openjdk8
RUN apk add --no-cache git
RUN apk add --no-cache openssh
RUN ssh-keygen -b 2048 -t rsa -f /root/.ssh/id_rsa -q -N ""
RUN ssh-keyscan git.thm.de >> ~/.ssh/known_hosts
ADD build/install/secrettoken-checker /usr/local/secrettoken-checker
VOLUME /upload-dir
VOLUME /usr/local/appconfig/application.config
WORKDIR /usr/local/secrettoken-checker/bin
ENTRYPOINT ["./secrettoken-checker"]
MAINTAINER Benjamin Manns <benjamin.manns@mni.thm.de>