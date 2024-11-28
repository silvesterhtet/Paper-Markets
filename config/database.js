const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mysql21717',
  database: process.env.DB_NAME || 'papertrader'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  } else {
    console.log('Connected to the MySQL database');
  }
});

module.exports = connection;