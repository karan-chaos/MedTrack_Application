FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /app
COPY pom.xml .

# Download dependencies (assume no mvnw, use maven if installed, else copy from maven image)
# Actually, since it's a multi-stage we can just use maven image directly
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/medtrack-backend-*.jar app.jar
ENV PORT=8081
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
