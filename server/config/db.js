const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

async function getConnection() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('Connected to MySQL database successfully');
  return connection;
}

module.exports = { getConnection };