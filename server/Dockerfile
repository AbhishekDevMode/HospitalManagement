FROM eclipse-temurin:26-jdk-jammy AS build
WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./

RUN chmod +x mvnw

# Copy the rest of the source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# --- Step 2: Run the Application ---
FROM eclipse-temurin:26-jre-jammy
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Expose the default port Render uses
EXPOSE 8081

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]