FROM gradle:jdk18 AS BUILD

COPY . /build
WORKDIR /build

RUN gradle fbs-runner.checker:installDist

FROM openjdk:18.0.2-slim

# Install Docker
RUN apt-get update && apt-get install -y --no-install-recommends docker.io curl

COPY --from=build /build/modules/fbs-runner/checker/build/install/fbs-runner.checker /usr/local/fbs-runner.checker
EXPOSE 8081
WORKDIR /usr/local/fbs-runner.checker/bin

# prepare volumes which needs to mount
VOLUME /upload-dir
VOLUME /dockertemp

ENTRYPOINT ["./fbs-runner.checker", "run", "scala:de.thm.ii.fbs.MainVerticle"]
