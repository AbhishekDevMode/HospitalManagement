# Stage 1: Build the Spring Boot application using Java 26
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application and skip tests for a faster deployment
RUN mvn clean package -DskipTests

# Stage 2: Run the application using Java 26 JRE
FROM eclipse-temurin:26-jre-alpine
WORKDIR /app

# Copy the compiled jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8081 as required by your app
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]