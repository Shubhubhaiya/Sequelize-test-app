// config.js
require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV,
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    timezone: 'UTC',
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false
      }
    }
  },
  test: {
    username: process.env.TEST_DB_USERNAME || 'root',
    password: process.env.TEST_DB_PASSWORD || null,
    database: process.env.TEST_DB_NAME || 'database_test',
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    username: process.env.PROD_DB_USERNAME || 'root',
    password: process.env.PROD_DB_PASSWORD || null,
    database: process.env.PROD_DB_NAME || 'database_production',
    host: process.env.PROD_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false
      }
    }
  }
};
