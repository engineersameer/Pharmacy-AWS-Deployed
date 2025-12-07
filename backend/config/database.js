require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Database Configuration
 * Supports both local MySQL and AWS RDS
 */
const getDatabaseConfig = () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pharmacy_db',
    // Pool configuration
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Connection timeout (valid for both Connection and Pool)
    connectTimeout: 30000 // 30 seconds
  };

  // SSL configuration for RDS
  if (process.env.DB_SSL === 'true') {
    config.ssl = {
      rejectUnauthorized: false
    };
  }

  return config;
};

// Create connection pool with configuration
const pool = mysql.createPool(getDatabaseConfig());

/**
 * Test database connection (non-blocking)
 */
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL connection pool created successfully');
    connection.release();
  })
  .catch(err => {
    handleConnectionError(err);
  });

/**
 * Handle database connection errors with helpful messages
 */
function handleConnectionError(err) {
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('\n❌ MySQL Access Denied Error!');
    console.error('Please check your .env file configuration.\n');
    console.error('Required environment variables:');
    console.error('  DB_HOST=your-rds-endpoint.region.rds.amazonaws.com');
    console.error('  DB_PORT=3306');
    console.error('  DB_USER=your_username');
    console.error('  DB_PASSWORD=your_password');
    console.error('  DB_NAME=pharmacy_db');
    console.error('  DB_SSL=true (for RDS)\n');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('\n❌ Connection Refused!');
    console.error('Please verify:');
    console.error('  1. Database server is running');
    console.error('  2. Host and port are correct');
    console.error('  3. Security group allows connections (for RDS)\n');
  } else if (err.code === 'ETIMEDOUT') {
    console.error('\n❌ Connection Timeout!');
    console.error('Please check:');
    console.error('  1. Network connectivity');
    console.error('  2. Security group settings (for RDS)');
    console.error('  3. Database endpoint is correct\n');
  } else {
    console.error('❌ Database connection error:', err.message);
  }
}

module.exports = pool;
