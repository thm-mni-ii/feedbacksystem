FROM gradle:jdk18 AS build

RUN mkdir /build
WORKDIR /build

# Copy gradle files
COPY *.gradle scalastyle_config.xml /build/
RUN mkdir -p /build/modules/fbs-core/api
COPY modules/fbs-core/api/*.gradle modules/fbs-core/api/
RUN mkdir -p /build/modules/fbs-core/math-parser
COPY modules/fbs-core/math-parser/*.gradle modules/fbs-core/math-parser/
RUN mkdir -p /build/modules/fbs-runner/checker
COPY modules/fbs-runner/checker/*.gradle /build/modules/fbs-runner/checker/

# Build web
COPY modules/fbs-core/web /build/modules/fbs-core/web/
RUN apt-get update && apt-get install -y build-essential curl
RUN gradle fbs-core.web:installDist

# Copy math-parser
COPY modules/fbs-core/math-parser /build/modules/fbs-core/math-parser/

# Build api
COPY modules/fbs-core/api /build/modules/fbs-core/api/
RUN gradle fbs-core.web:copyWebToWS fbs-core.api:installDist

FROM eclipse-temurin:18-jre

RUN apt-get update && apt-get install -y curl

COPY --from=build /build/modules/fbs-core/api/build/install/fbs-core.api /usr/local/fbs-core.api

VOLUME /usr/local/fbs-core.api/markdown
VOLUME /usr/local/fbs-core.api/conf
VOLUME /upload-dir
EXPOSE 433

WORKDIR /usr/local/fbs-core.api/bin
ENV JAVA_OPTS=""
ENTRYPOINT ["./wsd"]
