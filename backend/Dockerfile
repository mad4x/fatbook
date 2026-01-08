# Fase 1: Build (Compiliamo il codice Java usando Maven)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compila e crea il file .jar saltando i test per velocità
RUN mvn clean package -DskipTests

# Fase 2: Run (Eseguiamo solo il file compilato - più leggero)
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]