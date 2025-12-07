# AWS RDS Configuration Guide

## Your RDS Endpoint
```
pharmacy-db.c0pkukq4a7dd.us-east-1.rds.amazonaws.com
```

## Quick Setup Steps

### 1. Create .env File

Create a `.env` file in the `backend` directory with the following content:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# AWS RDS MySQL Configuration
DB_HOST=pharmacy-db.c0pkukq4a7dd.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=your_rds_master_username
DB_PASSWORD=your_rds_master_password
DB_NAME=pharmacy_db
DB_SSL=true

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here
```

### 2. Update Credentials

Replace these values in your `.env` file:
- `DB_USER` - Your RDS master username (usually set during RDS creation)
- `DB_PASSWORD` - Your RDS master password
- `JWT_SECRET` - Generate a strong random string (e.g., use `openssl rand -base64 32`)

### 3. RDS Security Group Configuration

**Important:** Make sure your RDS Security Group allows inbound connections:

1. Go to AWS Console → RDS → Your Database → Connectivity & Security
2. Click on the Security Group
3. Edit Inbound Rules
4. Add rule:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: Your IP address (or 0.0.0.0/0 for testing only - NOT recommended for production)

### 4. Initialize Database

```bash
npm run init-db
```

This will:
- Connect to your RDS instance
- Create the `pharmacy_db` database (if it doesn't exist)
- Create `customers` and `orders` tables

### 5. Seed Admin User (Optional)

```bash
npm run seed-admin
```

This creates a default admin user:
- Phone: `03333333333`
- Password: `Admin@123`

### 6. Start Server

```bash
npm start
```

## Verification

After starting the server, you should see:

```
🔌 Attempting to connect to MySQL...
📍 DB Host: pharmacy-db.c0pkukq4a7dd.us-east-1.rds.amazonaws.com
📊 DB Name: pharmacy_db
🔒 SSL: Enabled
✅ Connected to database 'pharmacy_db'
✅ Customers table ready
✅ Orders table ready
✅ Database initialization completed successfully
✅ Connected to MySQL successfully

╔═══════════════════════════════════════╗
║     🚀 Server is Running              ║
╠═══════════════════════════════════════╣
║  📡 Port:        5001                 ║
║  🌍 Mode:        development          ║
║  💾 Database:    MySQL (RDS)          ║
║  🔑 JWT Secret:  ✅ Set               ║
╚═══════════════════════════════════════╝
```

## Troubleshooting

### Connection Timeout
- **Check Security Group:** Ensure port 3306 is open for your IP
- **Check RDS Status:** Verify RDS instance is running
- **Check Endpoint:** Verify endpoint is correct

### Access Denied
- **Verify Credentials:** Check username and password in `.env`
- **Check User Permissions:** Ensure RDS master user has proper permissions

### SSL Error
- **Enable SSL:** Make sure `DB_SSL=true` in `.env`
- **Check RDS SSL:** Verify RDS instance supports SSL

### Database Not Found
- **Create Database:** Run `npm run init-db` to create database and tables
- **Check DB_NAME:** Verify database name in `.env` matches RDS

## Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use strong passwords** - For both RDS and JWT_SECRET
3. **Restrict Security Group** - Only allow your IP, not 0.0.0.0/0
4. **Enable SSL** - Always use `DB_SSL=true` for RDS
5. **Rotate credentials** - Regularly update passwords
6. **Use IAM authentication** - Consider using IAM database authentication for production

## Production Checklist

- [ ] Strong JWT_SECRET configured
- [ ] RDS Security Group restricted to specific IPs
- [ ] SSL enabled (`DB_SSL=true`)
- [ ] Database backups configured
- [ ] Monitoring and alerts set up
- [ ] Environment variables secured (use AWS Secrets Manager for production)

