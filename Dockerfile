FROM node:20-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM eclipse-temurin:17-jdk AS backend-builder
WORKDIR /backend
COPY backend/gradle/ gradle/
COPY backend/gradlew backend/build.gradle.kts backend/settings.gradle.kts ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon
COPY backend/src/ src/
COPY --from=frontend-builder /frontend/dist/ src/main/resources/static/
RUN ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend-builder /backend/build/libs/server-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
