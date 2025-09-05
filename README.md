# Spring Boot GraphQL Generator

Spring Boot GraphQL Generator is an automatic code generator for building GraphQL applications with Spring Boot.

## Features

* **Input:**

  * SQL files containing `CREATE TABLE` statements
  * SQLite database files

* **Configuration:**
  Users can specify:

  * Java package name
  * Group ID and Artifact ID
  * Service name and description
  * Java and application version
  * Application port
  * Database configuration: JDBC URL, username, password, driver, dialect

* **Output:**

  * Ready-to-use Spring Boot project with GraphQL and JPA integration
  * Maven wrapper files (`mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties`)
  * Application configuration file (`application.properties`)
  * Java code: entity, DTO, repository, controller, utility, and GraphQL schema
  * Automatically generated ERD (Entity Relationship Diagram)
  * Entity structure documentation in Markdown format

* **Diagram Renderer:**

  * Automatically generates an **ERD (Entity Relationship Diagram)** based on the input
  * Supports both SQL files and SQLite database files
  * Visualizes table structures, columns, primary keys, and relationships

## How It Works

1. Select an SQL or SQLite file as input.
2. Fill in application and database configuration via the form.
3. View the ERD diagram and detected entity descriptions.
4. Select entities to generate.
5. The generator creates the entire Spring Boot GraphQL project automatically.
6. Download the result as a ZIP file, ready to build with Maven.

## Purpose

Spring Boot GraphQL Generator aims to simplify and accelerate the process of creating GraphQL applications with Spring Boot. By automating the initial setup, developers can focus on implementing business logic and custom features rather than boilerplate configuration.

## Data Sample

https://github.com/Planetbiru/DatabaseSample

## License

MIT License. See [LICENSE](LICENSE) for details.