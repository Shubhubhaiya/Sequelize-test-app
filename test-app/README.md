# S&G Mercator Resource Management

## Overview

`S&G Mercator Resource Management` manages resources, deal leads and deals.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Technologies Used](#technologies-used)
- [Author](#author)
- [License](#license)

## Features

- **Express Framework**: RESTful API development using Express.js.
- **Sequelize ORM**: Database management and migrations for PostgreSQL.
- **Authentication**: Pending.
- **Swagger API Documentation**: Swagger-UI for interactive API documentation.
- **Validation**: Data validation using Joi.
- **File Uploads**: File uploads via Multer.
- **Testing**: Pending.

## Project Structure

```plaintext
test-app/
│
├── node_modules/           # Dependencies
├── src/
│   ├── config/             # Configuration files
│   │   ├── config.js       # Database configuration
│   │   ├── responseMessages.js
│   │   ├── roles.js
│   │   ├── statusCodes.js
│   │   └── swagger.js
│   ├── controllers/        # Controllers for handling requests
│   ├── database/           # Database-related files
│   │   ├── migrations/     # Database migration files
│   │   ├── models/         # Sequelize models
│   │   └── seeders/        # Seeder files for populating data
│   ├── app.js              # Main application file
│   └── ...                 # Other directories and files
│
├── package.json            # Project metadata and dependencies
├── README.md               # Project documentation (you are here)
└── ...                     # Other files
```

## Getting Started

### Prerequisites

- **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **PostgreSQL**: Ensure PostgreSQL is installed and running.
- **PgAdmin**: Should be installed to view databse data.

### Installation

1. **Clone the repository**:

   ```bash
   git clone
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory and add your environment variables (e.g., database credentials).

4. **Run database migrations**:

   ```bash
   npm run migrate
   ```

5. **Seed the database (optional)**:

   ```bash
   npm run seed
   ```

### Running the Application

- To run the application in development mode:

  ```bash
  npm run dev
  ```

- The app will run on `http://localhost:5000` by default.

## Scripts

- **Development**: `npm run dev` — Start the server with `nodemon`.
- **Testing**: `npm run test` — Run tests with Jest.
- **Database Migrations**:
  - `npm run migrate` — Run all migrations.
  - `npm run migrate:undo` — Undo the last migration.
  - `npm run migrate:undo:all` — Undo all migrations.
- **Database Seeding**:
  - `npm run seed` — Run all seeders.
  - `npm run seed:undo` — Undo the last seeder.
  - `npm run seed:undo:all` — Undo all seeders.
- **Generate Files**:
  - `npm run create:migration --name <migration-name>` — Create a new migration file.
  - `npm run create:model --name <model-name> --attributes <attributes>` — Create a new model file.
  - `npm run create:seed --name <seed-name>` — Create a new seed file.

## Technologies Used

- **Backend Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Sequelize](https://sequelize.org/)
- **Authentication**: Pending
- **Validation**: [Joi](https://joi.dev/)
- **Testing**: Pending
- **API Documentation**: [Swagger](https://swagger.io/)

## Author

- **Shubhdeep Verma**
