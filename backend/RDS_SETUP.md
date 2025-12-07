# AWS RDS MySQL Setup Guide

## RDS Connection Configuration

Agar aap AWS RDS use kar rahe hain, to `.env` file mein yeh configuration add karein:

## Required Information from RDS

Aapko RDS se yeh information chahiye:
1. **Endpoint** (Host) - Example: `mydb.123456789.us-east-1.rds.amazonaws.com`
2. **Port** - Usually `3306` for MySQL
3. **Username** - RDS master username
4. **Password** - RDS master password
5. **Database Name** - Database name (agar already created hai, warna hum create kar denge)

## .env File Configuration for RDS

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# AWS RDS MySQL Configuration
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_USER=your_rds_username
DB_PASSWORD=your_rds_password
DB_NAME=pharmacy_db
DB_SSL=true

# JWT Secret
JWT_SECRET=your_secret_key_here
```

## Example RDS .env File

```env
PORT=5001
NODE_ENV=development

# Example RDS Endpoint
DB_HOST=mydb.123456789.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=MySecurePassword123
DB_NAME=pharmacy_db
DB_SSL=true

JWT_SECRET=my_super_secret_jwt_key_12345
```

## Steps to Configure

1. **RDS Endpoint find karein:**
   - AWS Console → RDS → Databases
   - Apni database select karein
   - "Connectivity & security" tab mein endpoint milega

2. **Security Group check karein:**
   - RDS Security Group mein port 3306 allow hona chahiye
   - Agar local machine se connect kar rahe hain, to apne IP ko allow karein
   - Ya 0.0.0.0/0 (temporary, production mein avoid karein)

3. **.env file update karein:**
   - `DB_HOST` = RDS endpoint
   - `DB_PORT` = 3306 (default MySQL port)
   - `DB_USER` = RDS master username
   - `DB_PASSWORD` = RDS master password
   - `DB_NAME` = Database name (agar nahi hai to automatically create ho jayega)
   - `DB_SSL=true` (usually required for RDS)

4. **Server start karein:**
   ```bash
   npm start
   ```

## Important Notes

- **Security Group**: RDS Security Group mein apne IP ko allow karna zaroori hai
- **Database Creation**: Agar database already exist karta hai, to use hi use hoga. Agar nahi hai, to automatically create ho jayega (agar permissions allow karte hain)
- **SSL**: RDS ke liye usually SSL required hota hai, isliye `DB_SSL=true` set karein
- **Public Access**: Agar RDS publicly accessible nahi hai, to VPN ya bastion host use karna hoga

## Troubleshooting

### Connection Timeout
- Security Group check karein - port 3306 allow hai ya nahi
- VPC settings check karein - public access enabled hai ya nahi

### Access Denied
- Username/password verify karein
- RDS master credentials check karein

### SSL Error
- `DB_SSL=true` set karein
- Ya `DB_SSL=false` try karein (agar SSL required nahi hai)

## Testing Connection

Server start karne ke baad, agar connection successful hai to yeh message dikhega:
```
Connecting to MySQL at your-endpoint:3306 as username...
Database 'pharmacy_db' ready
Customers table ready
Orders table ready
Database initialization completed successfully
```

