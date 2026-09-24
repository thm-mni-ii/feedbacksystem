FROM gradle:7.6.4-jdk17 AS build

COPY . /build
WORKDIR /build

RUN chmod +x ./gradlew && ./gradlew :fbs-core.api:installDist --no-daemon

FROM eclipse-temurin:17-jre

RUN apt-get update && apt-get install -y curl

COPY --from=build /build/modules/fbs-core/api/build/install/fbs-core.api /usr/local/fbs-core.api

VOLUME /usr/local/fbs-core.api/markdown
VOLUME /usr/local/fbs-core.api/conf
VOLUME /upload-dir
EXPOSE 443

WORKDIR /usr/local/fbs-core.api/bin
ENV JAVA_OPTS=""
ENTRYPOINT ["./wsd"]
