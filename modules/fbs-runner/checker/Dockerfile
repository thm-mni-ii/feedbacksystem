FROM openjdk:14.0.1-slim

# Install Docker
RUN apt-get update && apt-get install -y --no-install-recommends docker.io

ADD build/install/fbs-runner.checker /usr/local/fbs-runner.checker
EXPOSE 8081
WORKDIR /usr/local/fbs-runner.checker/bin

# prepare volumes which needs to mount
VOLUME /upload-dir
VOLUME /dockertemp

ENTRYPOINT ["./fbs-runner.checker", "run", "scala:de.thm.ii.fbs.MainVerticle"]