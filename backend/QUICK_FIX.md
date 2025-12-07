# 🔴 QUICK FIX - Connection Timeout Issue

## Problem
- Security Group rule ✅ (already configured)
- DNS resolution ✅ (working)
- But connection timeout ❌ (still failing)

## Root Cause
**RDS is NOT publicly accessible!**

The IP `172.31.91.2` is a **private IP**, which means your RDS instance is not publicly accessible.

## ✅ Solution (2 Steps)

### Step 1: Enable Public Accessibility

1. **Go to AWS Console:**
   - Navigate to: RDS → Databases → `pharmacy-db`

2. **Modify Database:**
   - Click on your database
   - Click **"Modify"** button (top right)

3. **Enable Public Access:**
   - Scroll down to **"Connectivity"** section
   - Find **"Publicly accessible"**
   - Change from **"No"** to **"Yes"**
   - Click **"Continue"**

4. **Apply Changes:**
   - Select **"Apply immediately"**
   - Click **"Modify DB instance"**
   - ⏳ **Wait 5-10 minutes** for modification to complete

### Step 2: Update .env File

Make sure your `.env` file has:

```env
DB_HOST=pharmacy-db.c0pkukq4a7dd.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_password
DB_NAME=pharmacy_db
DB_SSL=true
```

**Important:** `DB_SSL=true` should be set for RDS.

### Step 3: Test Again

After RDS modification completes (5-10 minutes):

```bash
npm run test-connection
```

You should see:
```
✅ Public IP detected (52.xx.xx.xx) - Good!
✅ Connection successful!
```

## ⚠️ Why This Happens

- RDS by default creates instances that are **NOT publicly accessible** for security
- Private IP (172.31.x.x) means it's only accessible from within the VPC
- To connect from your local machine, you need public accessibility enabled

## 🔒 Security Note

After enabling public access:
- ✅ Keep Security Group restricted (you already have 0.0.0.0/0 - consider restricting to your IP)
- ✅ Use SSL (`DB_SSL=true`)
- ✅ Use strong passwords
- ✅ Consider using VPN or EC2 instance for production

## 📸 Visual Guide

When you modify RDS, you'll see:
```
Connectivity
├── Network type: IPv4
├── VPC: vpc-xxxxx
├── Subnet group: default
└── Publicly accessible: [No] → Change to [Yes] ← THIS!
```

## ✅ Verification

After modification:
1. Go to RDS → Your Database → Connectivity & Security
2. Check "Publicly accessible" should show "Yes"
3. The endpoint should resolve to a public IP (not 172.31.x.x)

Then test:
```bash
npm run test-connection
```

