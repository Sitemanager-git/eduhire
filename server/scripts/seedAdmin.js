// server/scripts/seedAdmin.js
// Usage: node server/scripts/seedAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');

const seedAdmin = async () => {
  try {
    console.log('🌱 Seeding admin user...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ 
      username: 'admin' 
    });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }
    
    // Create default superadmin
    const admin = new AdminUser({
      username: 'admin',
      email: 'admin@eduhire.com',
      password: 'Admin@123',  // CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN
      role: 'superadmin',
      permissions: {
        canModerateJobs: true,
        canModerateReviews: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManagePayments: true,
        canManageSystem: true
      },
      isActive: true
    });
    
    await admin.save();
    
    console.log('');
    console.log('✅ ADMIN USER CREATED SUCCESSFULLY');
    console.log('═══════════════════════════════════');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Password: Admin@123');
    console.log('Role:', admin.role);
    console.log('═══════════════════════════════════');
    console.log('');
    console.log('⚠️  IMPORTANT: Change password immediately after first login!');
    console.log('');
    console.log('Login URL: http://localhost:3000/admin/login');
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
