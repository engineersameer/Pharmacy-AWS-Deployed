# Connection Timeout Troubleshooting Guide

## Error: `ETIMEDOUT` or `connect ETIMEDOUT`

This error means your connection to RDS is timing out. Here's how to fix it:

## 🔴 Most Common Cause: Security Group Configuration

### Step 1: Check RDS Security Group

1. **Go to AWS Console:**
   - Navigate to: RDS → Databases → Your Database (`pharmacy-db`)

2. **Find Security Group:**
   - Click on your database
   - Go to "Connectivity & security" tab
   - Note the Security Group name (e.g., `sg-xxxxx`)

3. **Edit Inbound Rules:**
   - Click on the Security Group link
   - Go to "Inbound rules" tab
   - Click "Edit inbound rules"
   - Click "Add rule"
   - Configure:
     ```
     Type: MySQL/Aurora
     Protocol: TCP
     Port: 3306
     Source: My IP (or 0.0.0.0/0 for testing - NOT for production)
     ```
   - Click "Save rules"

### Step 2: Check Public Accessibility

1. **Go to RDS Database:**
   - Click on your database
   - Go to "Connectivity & security" tab
   - Check "Publicly accessible" setting

2. **If it says "No":**
   - Click "Modify"
   - Under "Connectivity", set "Publicly accessible" to "Yes"
   - Click "Continue"
   - Choose "Apply immediately"
   - Click "Modify DB instance"
   - Wait for modification to complete (5-10 minutes)

### Step 3: Find Your IP Address

1. **Get your public IP:**
   - Visit: https://whatismyipaddress.com/
   - Copy your IPv4 address

2. **Add to Security Group:**
   - Use format: `YOUR_IP/32` (e.g., `203.0.113.0/32`)
   - Or use `0.0.0.0/0` for testing (allows all IPs - NOT secure for production)

## 🧪 Test Connection

After updating Security Group, test the connection:

```bash
npm run test-connection
```

This will:
- Test DNS resolution
- Test port connectivity
- Test MySQL connection
- Show detailed error messages

## 📋 Quick Checklist

- [ ] Security Group has inbound rule for port 3306
- [ ] Your IP address is allowed (or 0.0.0.0/0 for testing)
- [ ] RDS is "Publicly accessible"
- [ ] RDS instance is running (not stopped)
- [ ] `.env` file has correct credentials
- [ ] Network/firewall is not blocking port 3306

## 🔧 Alternative Solutions

### Option 1: Use EC2 Instance (More Secure)

If you don't want RDS publicly accessible:

1. Launch an EC2 instance in the same VPC as RDS
2. Connect to RDS from EC2 (no public access needed)
3. Run your application on EC2

### Option 2: Use AWS Systems Manager Session Manager

1. Connect to EC2 via Session Manager
2. Run application from EC2
3. More secure than public access

### Option 3: VPN Connection

1. Set up AWS VPN or Direct Connect
2. Connect through VPN
3. Access RDS from your network

## 🚨 Security Warning

**NEVER use `0.0.0.0/0` in production!**

- Always restrict to specific IP addresses
- Use VPC security groups for better control
- Consider using AWS PrivateLink for private connections

## 📞 Still Having Issues?

1. **Check RDS Status:**
   - Ensure instance is "Available" (not "Stopped" or "Modifying")

2. **Check VPC Settings:**
   - Ensure RDS is in a VPC with internet gateway
   - Check route tables

3. **Check Network ACLs:**
   - Ensure no ACLs are blocking port 3306

4. **Test from Different Network:**
   - Try from different location/IP
   - Helps identify if it's network-specific

5. **Check CloudWatch Logs:**
   - Look for connection attempts in CloudWatch
   - Check for any error patterns

## ✅ Success Indicators

When connection works, you'll see:

```
✅ DNS resolved: pharmacy-db.c0pkukq4a7dd.us-east-1.rds.amazonaws.com → 52.xx.xx.xx
✅ Connection successful!
✅ MySQL Version: 8.0.xx
✅ All tests passed! Connection is working.
```

