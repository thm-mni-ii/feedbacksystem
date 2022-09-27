FROM gradle:jdk18 AS BUILD

COPY . /build
WORKDIR /build

RUN gradle dist

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
