# syntax=docker/dockerfile:1
FROM node:20-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY frontend/ ./
RUN npx vite build --outDir ./dist

FROM eclipse-temurin:25-jdk AS backend-builder
WORKDIR /backend
COPY backend/gradle/ gradle/
COPY backend/gradlew backend/build.gradle.kts backend/settings.gradle.kts backend/gradle.properties ./
RUN --mount=type=cache,target=/root/.gradle chmod +x gradlew && ./gradlew dependencies --no-daemon
COPY backend/src/ src/
COPY --from=frontend-builder /frontend/dist/ src/main/resources/static/
RUN --mount=type=cache,target=/root/.gradle ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=backend-builder /backend/build/libs/server-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
