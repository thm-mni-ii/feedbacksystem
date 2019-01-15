FROM openjdk:8-jre-alpine

ADD build/install/secrettoken-checker /usr/local/secrettoken-checker

WORKDIR /usr/local/secrettoken-checker/bin
ENTRYPOINT ["./secrettoken-checker"]
