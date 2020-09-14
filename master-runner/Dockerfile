FROM openjdk:14.0.1-slim

ADD build/install/master-runner /usr/local/master-runner
EXPOSE 8081
WORKDIR /usr/local/master-runner/bin
ENTRYPOINT ["./master-runner", "run", "scala:de.thm.ii.fbs.MainVerticle"]