FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S calendario && adduser -S calendario -G calendario
COPY --from=build /app/target/*.jar app.jar
RUN chown calendario:calendario app.jar
USER calendario
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
