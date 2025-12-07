# Pharmacy Portal Backend

MERN stack backend migrated to MySQL (AWS RDS compatible).

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- AWS RDS MySQL instance (or local MySQL)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your RDS credentials:
   ```env
   DB_HOST=pharmacy-db.c0pkukq4a7dd.us-east-1.rds.amazonaws.com
   DB_PORT=3306
   DB_USER=your_rds_username
   DB_PASSWORD=your_rds_password
   DB_NAME=pharmacy_db
   DB_SSL=true
   JWT_SECRET=your_secret_key
   ```

3. **Initialize database:**
   ```bash
   npm run init-db
   ```

4. **Seed admin user (optional):**
   ```bash
   npm run seed-admin
   ```

5. **Start server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # MySQL connection pool
│   └── initDatabase.js     # Database initialization
├── controllers/
│   ├── AdminController.js
│   ├── authController.js
│   └── customerController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── Customer.js         # Customer model (MySQL)
│   └── Order.js            # Order model (MySQL)
├── routes/
│   ├── AdminRoute.js
│   ├── authRoutes.js
│   └── CustomerRouter.js
├── uploads/
│   └── prescriptions/      # Prescription file uploads
├── .env                    # Environment variables (create from .env.example)
├── server.js               # Express server
└── SeedAdmin.js           # Admin user seeder
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment mode | `development` |
| `DB_HOST` | MySQL/RDS host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | Database username | `root` |
| `DB_PASSWORD` | Database password | `` |
| `DB_NAME` | Database name | `pharmacy_db` |
| `DB_SSL` | Enable SSL (for RDS) | `false` |
| `JWT_SECRET` | JWT secret key | Required |

## 📊 Database Schema

### Customers Table
- `id` (INT, PRIMARY KEY)
- `name` (VARCHAR)
- `age` (INT)
- `gender` (ENUM: male, female)
- `phone` (VARCHAR, UNIQUE)
- `address` (VARCHAR)
- `city` (VARCHAR)
- `password` (VARCHAR, hashed)
- `IsAdmin` (BOOLEAN)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Orders Table
- `id` (INT, PRIMARY KEY)
- `receiverName` (VARCHAR)
- `phone` (VARCHAR)
- `address` (VARCHAR)
- `filePath` (VARCHAR)
- `status` (ENUM: pending, processing, completed, cancelled)
- `userId` (INT, FOREIGN KEY → customers.id)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## 🔐 Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use strong JWT_SECRET** - Generate a random string for production
3. **RDS Security Group** - Only allow connections from trusted IPs
4. **SSL Connection** - Always use SSL for RDS (`DB_SSL=true`)

## 🛠️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize database and create tables
- `npm run seed-admin` - Create default admin user

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new customer
- `POST /api/auth/signin` - Login
- `GET /api/auth/profile` - Get current user profile

### Customer
- `GET /api/customers/profile` - Get profile
- `PUT /api/customers/profile` - Update profile
- `POST /api/customers/order` - Create order
- `GET /api/customers/order/customer/:userId` - Get customer orders
- `PUT /api/customers/order/:orderId` - Update order
- `DELETE /api/customers/order/:orderId` - Delete order

### Admin
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user

## 🔍 Troubleshooting

### Connection Issues
- Verify RDS endpoint is correct
- Check Security Group allows port 3306
- Verify credentials in `.env` file
- Ensure RDS instance is running

### Database Errors
- Run `npm run init-db` to create tables
- Check database name exists in RDS
- Verify user has CREATE TABLE permissions

## 📚 Migration Notes

This project was migrated from MongoDB (Mongoose) to MySQL. All API endpoints remain the same for frontend compatibility.

## 📄 License

MIT

