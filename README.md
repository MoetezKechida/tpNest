## Description

tpNest is a REST API built with the NestJS framework, designed for managing Curriculum Vitae (CVs), Users, and Skills. It includes a modular architecture, robust error handling, and a sophisticated database configuration that adapts to both Dockerized and local environments.

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- Docker (optional, but recommended for PostgreSQL)
- MySQL (if running locally without Docker)

## Project Setup

Clone the repository and install the dependencies:

```bash
npm install
```

## Environment Configuration

The application requires specific environment variables to function correctly. A template file has been provided.

1. Copy the example environment file to create your local `.env`:
```bash
cp .env.example .env
```

2. Open the `.env` file and configure your database targets.

### Database Environments

The API supports switching between a native local MySQL instance or a Docker-based PostgreSQL instance. This is controlled entirely by the `USE_DOCKER` environment variable.

#### Option A: Docker with PostgreSQL (Recommended)
Set the variables in your `.env` to target the Docker container:
```env
USE_DOCKER=true
DB_PORT=5432
```
To start the PostgreSQL container, run:
```bash
npm run pg
```

#### Option B: Local MySQL
If you prefer not to use Docker, ensure a local MySQL database named `tpnest` exists and configure your `.env` as follows:
```env
USE_DOCKER=false
DB_PORT=3306
```

## Database Seeding

Once your database is running and your `.env` file is properly configured, you should populate the database with mock data. The seeder will automatically generate random Users, Skills, and CVs.

Run the seeding script:

```bash
npm run seed
```

## Compile and Run the Project

After seeding the database, you can start the application backend.

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Running Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## License

This project is MIT licensed.
