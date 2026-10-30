# Build stage: compile and package the Spring Boot jar
FROM eclipse-temurin:21-jdk AS build

WORKDIR /build

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -q dependency:go-offline

COPY src src
RUN ./mvnw -q package -DskipTests

# Runtime stage: JRE only
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /build/target/salary-management-backend-1.0.0.jar app.jar

EXPOSE 8000
CMD ["java", "-jar", "app.jar"]
