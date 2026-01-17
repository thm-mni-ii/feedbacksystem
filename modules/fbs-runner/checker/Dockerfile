FROM gradle:jdk18 AS BUILD

COPY . /build
WORKDIR /build

RUN gradle fbs-runner.checker:installDist

FROM eclipse-temurin:22.0.2_9-jre-alpine

# Install Docker
RUN apk add --no-cache docker curl postgresql15-client

COPY --from=build /build/modules/fbs-runner/checker/build/install/fbs-runner.checker /usr/local/fbs-runner.checker
EXPOSE 8081
WORKDIR /usr/local/fbs-runner.checker/bin

# prepare volumes which needs to mount
VOLUME /upload-dir
VOLUME /dockertemp

ENTRYPOINT ["./fbs-runner.checker", "run", "scala:de.thm.ii.fbs.MainVerticle"]
