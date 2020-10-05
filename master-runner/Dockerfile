FROM openjdk:14.0.1-slim

# Install Docker
RUN apt-get update && apt-get install -y --no-install-recommends docker.io

ADD build/install/master-runner /usr/local/master-runner
EXPOSE 8081
WORKDIR /usr/local/master-runner/bin

# prepare volumes which needs to mount
VOLUME /upload-dir
VOLUME /dockertemp

ENTRYPOINT ["./master-runner", "run", "scala:de.thm.ii.fbs.MainVerticle"]