FROM bees4ever/docker-git-ssh:latest
RUN apk update
RUN apk add --no-cache openjdk8
RUN ssh-keyscan git.thm.de >> ~/.ssh/known_hosts
ADD build/install/secrettoken-checker /usr/local/secrettoken-checker
VOLUME /upload-dir
VOLUME /usr/local/appconfig/application.config
WORKDIR /usr/local/secrettoken-checker/bin
ENTRYPOINT ["./secrettoken-checker"]
MAINTAINER Benjamin Manns <benjamin.manns@mni.thm.de>