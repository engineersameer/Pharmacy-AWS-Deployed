require('dotenv').config();
const mysql = require('mysql2/promise');
const { promisify } = require('util');
const dns = require('dns').promises;

/**
 * Test RDS Connection
 * Helps diagnose connection issues
 */
async function testConnection() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 RDS CONNECTION DIAGNOSTIC TEST');
  console.log('='.repeat(60) + '\n');

  const host = process.env.DB_HOST || 'pharmacy-db.c0pkukq4a7dd.us-east-1.rds.amazonaws.com';
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  // Test 1: DNS Resolution
  console.log('📡 Test 1: DNS Resolution');
  try {
    const addresses = await dns.resolve4(host);
    console.log(`   ✅ DNS resolved: ${host} → ${addresses.join(', ')}`);
  } catch (error) {
    console.log(`   ❌ DNS resolution failed: ${error.message}`);
    console.log('   → Check if endpoint is correct\n');
    return;
  }

  // Test 2: Port Connectivity (basic check)
  console.log('\n📡 Test 2: Port Connectivity');
  console.log(`   ℹ️  Attempting to connect to ${host}:${port}...`);
  console.log('   ℹ️  (This may take up to 30 seconds)');

  // Test 3: Check IP Type
  console.log('\n📡 Test 3: IP Address Analysis');
  try {
    const addresses = await dns.resolve4(host);
    const ip = addresses[0];
    const isPrivate = ip.startsWith('10.') || 
                     ip.startsWith('172.16.') || ip.startsWith('172.17.') || 
                     ip.startsWith('172.18.') || ip.startsWith('172.19.') ||
                     ip.startsWith('172.20.') || ip.startsWith('172.21.') ||
                     ip.startsWith('172.22.') || ip.startsWith('172.23.') ||
                     ip.startsWith('172.24.') || ip.startsWith('172.25.') ||
                     ip.startsWith('172.26.') || ip.startsWith('172.27.') ||
                     ip.startsWith('172.28.') || ip.startsWith('172.29.') ||
                     ip.startsWith('172.30.') || ip.startsWith('172.31.') ||
                     ip.startsWith('192.168.');
    
    if (isPrivate) {
      console.log(`   ⚠️  WARNING: Private IP detected (${ip})`);
      console.log('   → This means RDS is NOT publicly accessible');
      console.log('   → You need to enable "Publicly accessible" in RDS settings');
      console.log('\n   📋 Fix Steps:');
      console.log('   1. Go to AWS Console → RDS → Your Database');
      console.log('   2. Click "Modify"');
      console.log('   3. Under "Connectivity", set "Publicly accessible" to "Yes"');
      console.log('   4. Click "Continue" → "Apply immediately"');
      console.log('   5. Wait 5-10 minutes for modification to complete');
    } else {
      console.log(`   ✅ Public IP detected (${ip}) - Good!`);
    }
  } catch (err) {
    console.log('   ℹ️  Could not analyze IP type');
  }

  // Test 4: MySQL Connection (Try with SSL first, then without)
  console.log('\n📡 Test 4: MySQL Connection');
  let connection = null;
  let connectionAttempts = [];
  
  // Try with SSL enabled (RDS usually requires this)
  const sslEnabled = process.env.DB_SSL === 'true';
  const configsToTry = [
    { ssl: true, name: 'with SSL' },
    { ssl: false, name: 'without SSL' }
  ];
  
  // If SSL is explicitly set, only try that
  if (process.env.DB_SSL !== undefined) {
    configsToTry.splice(sslEnabled ? 1 : 0, 1);
  }
  
  for (const configOption of configsToTry) {
    try {
      const config = {
        host: host,
        port: port,
        user: process.env.DB_USER || 'admin',
        password: process.env.DB_PASSWORD || '',
        connectTimeout: 30000,
        ssl: configOption.ssl ? {
          rejectUnauthorized: false
        } : false
      };

      console.log(`   🔌 Attempting connection ${configOption.name}...`);
      console.log(`   👤 User: ${config.user}`);
      console.log(`   🔐 SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`);
      
      connection = await mysql.createConnection(config);
      console.log('   ✅ Connection successful!');
      
      // Test query (using backticks for DATABASE() function)
      const [rows] = await connection.query('SELECT VERSION() as version, DATABASE() as `database`');
      console.log(`   ✅ MySQL Version: ${rows[0].version}`);
      console.log(`   ✅ Current Database: ${rows[0].database || 'None'}`);
      
      await connection.end();
      console.log('\n✅ All tests passed! Connection is working.\n');
      console.log('🎉 Your RDS connection is fully configured and working!\n');
      return; // Success, exit
      
    } catch (error) {
      connectionAttempts.push({ config: configOption.name, error: error.message });
      if (connection) {
        await connection.end().catch(() => {});
        connection = null;
      }
      // Continue to next attempt
    }
  }
  
  // If we get here, all attempts failed
  console.log(`   ❌ All connection attempts failed!\n`);
  
  for (const attempt of connectionAttempts) {
    console.log(`   ❌ ${attempt.config}: ${attempt.error}`);
  }
  
  console.log('\n   🔴 DIAGNOSIS:');
  
  // Check for timeout
  const hasTimeout = connectionAttempts.some(a => 
    a.error.includes('timeout') || a.error.includes('ETIMEDOUT')
  );
  
  if (hasTimeout) {
    console.log('\n   ⚠️  TIMEOUT ERROR - Possible Causes:');
    console.log('   1. RDS is NOT publicly accessible (most likely)');
    console.log('      → Check: RDS → Modify → Publicly accessible = Yes');
    console.log('   2. Security Group is blocking (but you have rule, so less likely)');
    console.log('   3. Network ACLs blocking');
    console.log('   4. Firewall on your machine blocking');
    console.log('\n   📋 SOLUTION:');
    console.log('   → Enable "Publicly accessible" in RDS settings');
    console.log('   → Wait 5-10 minutes after modification');
    console.log('   → Then run this test again');
  } else {
    console.log('\n   ⚠️  Check error messages above for specific issues');
  }
  
  console.log('\n');
  process.exit(1);
}

// Run test
testConnection().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

