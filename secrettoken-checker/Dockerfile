#FROM openjdk:8-jre-alpine
FROM openjdk:10-jre

ADD build/install/secrettoken-checker /usr/local/secrettoken-checker
VOLUME /upload-dir
WORKDIR /usr/local/secrettoken-checker/bin
ENTRYPOINT ["./secrettoken-checker"]
