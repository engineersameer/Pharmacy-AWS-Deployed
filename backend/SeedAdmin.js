const Customer = require('./models/Customer');
const initDatabase = require('./config/initDatabase');
require('dotenv').config();

async function seedAdmin() {
  try {
    // Initialize database first
    await initDatabase();

    const adminPhone = '03333333333'; // Set your admin phone number here
    const adminPassword = 'Admin@123'; // Set your admin password here

    // Check if admin already exists
    const existingAdmin = await Customer.findOne({ phone: adminPhone, IsAdmin: true });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.phone);
      process.exit(0);
      return;
    }

    // Create admin user with all required fields
    const admin = await Customer.create({
      name: 'Admin', // at least 2 chars
      age: 30, // between 18 and 100
      gender: 'male', // must be 'male' or 'female'
      phone: adminPhone,
      address: 'Admin Address', // at least 10 chars
      city: 'AdminCity', // any string
      password: adminPassword, // plain password, will be hashed by create method
      IsAdmin: true
    });

    console.log('Admin user created:', admin.phone);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
