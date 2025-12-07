# MongoDB to MySQL Migration Guide

This project has been migrated from MongoDB (Mongoose) to MySQL. All functionality remains the same, but the database backend has changed.

## What Changed

1. **Database**: MongoDB → MySQL
2. **ORM**: Mongoose → mysql2 (with custom model classes)
3. **Connection**: MongoDB connection → MySQL connection pool
4. **Models**: Mongoose schemas → MySQL tables with class-based models

## Setup Instructions

### 1. Install MySQL

Make sure MySQL is installed and running on your system.

### 2. Update Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pharmacy_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

This will install `mysql2` instead of `mongoose`.

### 4. Initialize Database

The database and tables will be automatically created when you start the server. Alternatively, you can run:

```bash
npm run init-db
```

This will create:
- Database: `pharmacy_db` (or your DB_NAME)
- Table: `customers`
- Table: `orders`

### 5. Seed Admin User

To create the default admin user:

```bash
npm run seed-admin
```

Default admin credentials:
- Phone: `03333333333`
- Password: `Admin@123`

### 6. Start the Server

```bash
npm start
# or for development
npm run dev
```

## Database Schema

### Customers Table

```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- name (VARCHAR(255), NOT NULL)
- age (INT, NOT NULL)
- gender (ENUM('male', 'female'), NOT NULL)
- phone (VARCHAR(50), NOT NULL, UNIQUE)
- address (VARCHAR(500), NOT NULL)
- city (VARCHAR(100), NOT NULL)
- password (VARCHAR(255), NOT NULL)
- IsAdmin (BOOLEAN, DEFAULT FALSE)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Orders Table

```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- receiverName (VARCHAR(255), NOT NULL)
- phone (VARCHAR(50), NOT NULL)
- address (VARCHAR(500), NOT NULL)
- filePath (VARCHAR(500), NOT NULL)
- status (ENUM('pending', 'processing', 'completed', 'cancelled'), DEFAULT 'pending')
- userId (INT, NOT NULL, FOREIGN KEY → customers.id)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

## Code Changes Summary

### Models

- `models/Customer.js`: Converted from Mongoose schema to MySQL class with static methods
- `models/Order.js`: Converted from Mongoose schema to MySQL class with static methods

### Database Connection

- `config/database.js`: New MySQL connection pool
- `config/initDatabase.js`: Database initialization script

### Controllers

All controllers have been updated to work with the new MySQL models:
- `controllers/authController.js`
- `controllers/customerController.js`
- `controllers/AdminController.js`

### Server

- `server.js`: Updated to use MySQL initialization instead of MongoDB connection

## API Compatibility

All API endpoints remain the same. The response format is identical to maintain frontend compatibility.

## Notes

- Object IDs (`_id`) are now integer IDs (`id`) in MySQL, but the API still returns `_id` for compatibility
- Password hashing remains the same (bcrypt)
- JWT tokens work exactly the same
- All validation rules are preserved

## Troubleshooting

### Connection Issues

If you get connection errors:
1. Verify MySQL is running: `mysql -u root -p`
2. Check your `.env` file has correct credentials
3. Ensure the database user has CREATE DATABASE privileges

### Table Creation Issues

If tables aren't created:
1. Run `npm run init-db` manually
2. Check MySQL error logs
3. Verify user has CREATE TABLE privileges

### Migration from Existing MongoDB Data

If you have existing MongoDB data, you'll need to:
1. Export data from MongoDB
2. Transform the data format (ObjectId → INT, etc.)
3. Import into MySQL tables

This migration guide assumes a fresh setup. For existing data migration, additional scripts would be needed.

