require('dotenv').config();
const { Pool } = require('pg');

// This creates a new connection pool using the credentials from your .env file
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Add a listener to check for successful connection
pool.on('connect', () => {
  console.log('✅ Database connection pool established successfully!');
});

module.exports = pool;
