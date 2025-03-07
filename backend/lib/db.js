const mysql = require('mysql2/promise');

// Function to create a database connection
exports.createDbConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};