FROM gradle:jdk18 AS BUILD

RUN mkdir /build
WORKDIR /build

COPY *.gradle scalastyle_config.xml /build
COPY modules/fbs-core/web /build/modules/fbs-core/web 
RUN mkdir /build/modules/fbs-core/api
COPY modules/fbs-core/api/*.gradle modules/fbs-core/api
RUN mkdir -p /build/modules/fbs-runner/checker
COPY modules/fbs-runner/checker/*.gradle /build/modules/fbs-runner/checker

RUN gradle fbs-core.web:installDist

COPY modules/fbs-core/web /build/modules/fbs-core/web 

RUN gradle fbs-core.web:copyWebToWS fbs-core.api:installDist

FROM openjdk:18.0.2-slim

RUN apt-get update && apt-get -y install curl

COPY --from=build /build/modules/fbs-core/api/build/install/fbs-core.api /usr/local/fbs-core.api

VOLUME /usr/local/fbs-core.api/markdown
VOLUME /usr/local/fbs-core.api/conf
VOLUME /upload-dir
EXPOSE 433

WORKDIR /usr/local/fbs-core.api/bin
ENV JAVA_OPTS=""
ENTRYPOINT ["./wsd"]
