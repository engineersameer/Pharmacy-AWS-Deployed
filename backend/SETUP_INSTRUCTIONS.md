# MySQL Setup Instructions

## Issue: Access Denied Error

If you're getting "Access denied for user 'root'@'localhost'", follow these steps:

## Step 1: Create .env File

Create a file named `.env` in the `backend` directory with the following content:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pharmacy_db

# JWT Secret (generate a random string)
JWT_SECRET=your_secret_key_here_make_it_long_and_random
```

## Step 2: Configure MySQL Password

### Option A: If MySQL has NO password (common in XAMPP/WAMP)
```env
DB_PASSWORD=
```
Leave `DB_PASSWORD` empty.

### Option B: If MySQL has a password
```env
DB_PASSWORD=your_actual_mysql_password
```

## Step 3: Verify MySQL is Running

### Windows (XAMPP/WAMP):
1. Open XAMPP/WAMP Control Panel
2. Make sure MySQL service is running (green/started)

### Windows (MySQL Service):
1. Open Services (Win + R, type `services.msc`)
2. Find "MySQL" service
3. Make sure it's running

### Command Line Test:
```bash
mysql -u root -p
```
If this works, use the same password in your `.env` file.

## Step 4: Common MySQL Password Scenarios

### XAMPP (Default - No Password):
```env
DB_PASSWORD=
```

### WAMP (Default - No Password):
```env
DB_PASSWORD=
```

### MySQL Standalone Installation:
- Usually has a password you set during installation
- Use that password in `.env`

### If You Forgot MySQL Password:
1. **XAMPP/WAMP**: Usually no password, try empty
2. **MySQL**: You may need to reset it

## Step 5: Test Connection

After creating `.env`, try starting the server:

```bash
npm start
```

## Quick Fix Commands

### Check if MySQL is running:
```bash
# Windows
net start | findstr MySQL

# Or check in XAMPP/WAMP control panel
```

### Test MySQL connection manually:
```bash
mysql -u root -p
# Enter password (or press Enter if no password)
```

### If connection works manually but not in Node.js:
- Double-check `.env` file exists in `backend` directory
- Make sure there are no extra spaces in `.env` values
- Restart the server after creating/updating `.env`

## Example .env File (No Password - XAMPP)

```env
PORT=5001
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pharmacy_db
JWT_SECRET=my_super_secret_jwt_key_12345
```

## Example .env File (With Password)

```env
PORT=5001
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mypassword123
DB_NAME=pharmacy_db
JWT_SECRET=my_super_secret_jwt_key_12345
```

## Still Having Issues?

1. **Verify .env file location**: Should be in `backend/.env` (same folder as `server.js`)
2. **Check file encoding**: Make sure it's saved as plain text (not UTF-8 BOM)
3. **Restart server**: After creating/updating `.env`, restart the Node.js server
4. **Check MySQL logs**: Look for MySQL error logs for more details

