FROM eclipse-temurin:17-jdk AS build

WORKDIR /build

COPY gradlew gradlew.bat ./
COPY gradle ./gradle
COPY build.gradle.kts settings.gradle.kts ./
COPY src ./src

RUN chmod +x ./gradlew
RUN ./gradlew bootJar --no-daemon
RUN cp build/libs/fbs-identity-service-*.jar app.jar


FROM eclipse-temurin:17-jre

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /build/app.jar /app/fbs-identity-service.jar

EXPOSE 8080

ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/fbs-identity-service.jar"]
