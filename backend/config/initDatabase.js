require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Database Initialization
 * Creates database and tables if they don't exist
 * Works with both local MySQL and AWS RDS
 */
async function initDatabase() {
  let connection = null;
  
  try {
    const dbName = process.env.DB_NAME || 'pharmacy_db';
    const dbConfig = getDatabaseConfig(false); // Connect without database first
    
    console.log(`🔌 Connecting to MySQL at ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}...`);
    
    // Step 1: Connect without database to create it if needed
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server');
    
    // Step 2: Create database if it doesn't exist
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      console.log(`✅ Database '${dbName}' ready`);
    } catch (dbError) {
      // If database creation fails, it might already exist or permission issue
      if (dbError.code === 'ER_DB_CREATE_EXISTS') {
        console.log(`ℹ️  Database '${dbName}' already exists`);
      } else {
        console.log(`ℹ️  Could not create database (may already exist): ${dbError.message}`);
      }
    }
    
    await connection.end();
    connection = null;

    // Step 3: Connect to the specific database
    const dbConfigWithDb = getDatabaseConfig(true); // Now include database name
    connection = await mysql.createConnection(dbConfigWithDb);
    console.log(`✅ Connected to database '${dbName}'`);

    // Step 4: Create tables
    await createTables(connection);

    await connection.end();
    console.log('✅ Database initialization completed successfully\n');
    
  } catch (error) {
    handleInitError(error);
    if (connection) {
      await connection.end().catch(() => {});
    }
    throw error;
  }
}

/**
 * Get database configuration from environment variables
 * @param {boolean} includeDatabase - Whether to include database name in config
 */
function getDatabaseConfig(includeDatabase = true) {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    // Connection timeout (only valid option for Connection)
    connectTimeout: 30000 // 30 seconds
  };

  // Add database name only if requested
  if (includeDatabase) {
    config.database = process.env.DB_NAME || 'pharmacy_db';
  }

  // SSL configuration for RDS
  if (process.env.DB_SSL === 'true') {
    config.ssl = {
      rejectUnauthorized: false
    };
  }

  return config;
}

/**
 * Create database tables
 */
async function createTables(connection) {
  // Create customers table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      age INT NOT NULL,
      gender ENUM('male', 'female') NOT NULL,
      phone VARCHAR(50) NOT NULL UNIQUE,
      address VARCHAR(500) NOT NULL,
      city VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      IsAdmin BOOLEAN DEFAULT FALSE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_phone (phone),
      INDEX idx_isAdmin (IsAdmin)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✅ Customers table ready');

  // Create orders table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      receiverName VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      address VARCHAR(500) NOT NULL,
      filePath VARCHAR(500) NOT NULL,
      status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
      userId INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES customers(id) ON DELETE CASCADE,
      INDEX idx_userId (userId),
      INDEX idx_status (status),
      INDEX idx_createdAt (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✅ Orders table ready');
}

/**
 * Handle initialization errors with helpful messages
 */
function handleInitError(error) {
  console.error('\n' + '='.repeat(60));
  console.error('❌ DATABASE CONNECTION FAILED');
  console.error('='.repeat(60));
  
  if (error.code === 'ETIMEDOUT' || error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
    console.error('\n🔴 CONNECTION TIMEOUT ERROR');
    console.error('\nThis usually means:');
    console.error('  1. RDS Security Group is blocking your IP address');
    console.error('  2. RDS instance is not publicly accessible');
    console.error('  3. Network/firewall is blocking the connection');
    console.error('\n📋 SOLUTION STEPS:');
    console.error('\n1. Check RDS Security Group:');
    console.error('   → Go to AWS Console → RDS → Your Database');
    console.error('   → Click on Security Group → Edit Inbound Rules');
    console.error('   → Add Rule:');
    console.error('      Type: MySQL/Aurora');
    console.error('      Port: 3306');
    console.error('      Source: Your IP address (or 0.0.0.0/0 for testing)');
    console.error('\n2. Check RDS Public Accessibility:');
    console.error('   → Go to RDS → Connectivity & Security');
    console.error('   → Ensure "Publicly accessible" is set to "Yes"');
    console.error('\n3. Verify Your IP Address:');
    console.error('   → Visit: https://whatismyipaddress.com/');
    console.error('   → Add this IP to Security Group');
    console.error('\n4. Test Connection:');
    console.error('   → Try: telnet pharmacy-db.c0pkukq4a7dd.us-east-1.rds.amazonaws.com 3306');
    console.error('   → If it fails, Security Group is blocking');
    console.error('\n5. Alternative: Use AWS Systems Manager Session Manager');
    console.error('   → Or connect through EC2 instance in same VPC');
    
  } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('\n🔴 ACCESS DENIED ERROR');
    console.error('\nPlease verify your .env file has correct credentials:');
    console.error('  DB_HOST=pharmacy-db.c0pkukq4a7dd.us-east-1.rds.amazonaws.com');
    console.error('  DB_PORT=3306');
    console.error('  DB_USER=your_rds_username');
    console.error('  DB_PASSWORD=your_rds_password');
    console.error('  DB_NAME=pharmacy_db');
    console.error('  DB_SSL=true');
    
  } else if (error.code === 'ER_BAD_DB_ERROR') {
    console.error('\n🔴 DATABASE NOT FOUND');
    console.error('Please create the database first or check DB_NAME in .env');
    
  } else if (error.code === 'ECONNREFUSED') {
    console.error('\n🔴 CONNECTION REFUSED');
    console.error('Please check:');
    console.error('  1. RDS instance is running');
    console.error('  2. Security group allows connections from your IP');
    console.error('  3. Endpoint is correct');
    
  } else {
    console.error('\n🔴 ERROR DETAILS:');
    console.error(`   Code: ${error.code || 'Unknown'}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Host: ${process.env.DB_HOST || 'Not set'}`);
  }
  
  console.error('\n' + '='.repeat(60) + '\n');
}

// Run initialization if called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Database setup complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Database setup failed');
      process.exit(1);
    });
}

module.exports = initDatabase;
