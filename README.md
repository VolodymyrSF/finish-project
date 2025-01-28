# Finish Project

## Overview
This project is built using the NestJS framework. It includes various features such as user authentication, database migrations, and API documentation. Below, you'll find instructions on how to set up, run, and work with the project.

---

## Prerequisites
Before running this project, ensure you have the following installed on your system:

- **Node.js** 
- **Docker** 
- **Docker Compose** 
- **Redis**
- **npm** 

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd finish-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
    - Create a `.env` file in the root directory.

---

## Running the Project

### 1. Start with Docker Compose
To set up the project with Docker (e.g., database, Redis, etc.), run the following command:
```bash
npm run start:docker:local
```

### 2. Start the Development Server
Once Docker containers are running, start the development server with:
```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`.

---

## Scripts
Below is a list of commonly used npm scripts:

### Development
- **Start in development mode:**
  ```bash
  npm run start:dev
  ```

- **Start with debugging:**
  ```bash
  npm run start:debug
  ```

### Production
- **Build the project:**
  ```bash
  npm run build
  ```

- **Start in production mode:**
  ```bash
  npm run start:prod
  ```

### Linting and Formatting
- **Run ESLint and fix issues:**
  ```bash
  npm run lint
  ```

- **Format code with Prettier:**
  ```bash
  npm run format
  ```



### Migrations
- **Create a new migration:**
  ```bash
  npm run migration:create --name=<migration_name>
  ```

- **Generate a migration:**
  ```bash
  npm run migration:generate -name=<migration_name>
  ```

- **Run migrations:**
  ```bash
  npm run migration:run
  ```

- **Revert the last migration:**
  ```bash
  npm run migration:revert
  ```

---

## Project Structure

- `src/` - Main source code directory.
    - `controllers/` - Contains all the controllers.
    - `services/` - Business logic and service layer.
    - `modules/` - Feature-specific modules.
    - `database/` - Database configuration and migrations.
- `dist/` - Compiled output (generated after running `npm run build`).

---

## API Documentation

API documentation is available via Swagger and Postman.

---
Swagger:
---
Once the server is running, navigate to:
```
http://localhost:3000/docs
```
This will display all available endpoints, their request/response structures, and example payloads.

---
Postman:
---
The project has a Postman collection for convenient endpoint testing. Download the collection file final_project.postman_collection.json and import it into Postman.

