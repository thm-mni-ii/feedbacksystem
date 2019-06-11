FROM docker:dind
RUN apk add --no-cache openjdk8
RUN apk add --no-cache git
ADD build/install/secrettoken-checker /usr/local/secrettoken-checker
VOLUME /upload-dir
VOLUME /usr/local/appconfig/application.config
WORKDIR /usr/local/secrettoken-checker/bin
ENTRYPOINT ["./secrettoken-checker"]
MAINTAINER Benjamin Manns <benjamin.manns@mni.thm.de>