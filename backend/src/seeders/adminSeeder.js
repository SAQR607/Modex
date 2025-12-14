const { User } = require('../models');
const sequelize = require('../config/database');

const seedAdmin = async () => {
  try {
    // Use environment variables if available, otherwise use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@financialmodex.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log('✓ Admin user already exists. Skipping creation.');
      return;
    }

    // Create admin user with first_name and last_name matching database schema
    const admin = await User.create({
      email: adminEmail,
      password: adminPassword, // Will be hashed by model hook
      first_name: adminFirstName,
      last_name: adminLastName,
      role: 'admin'
    });

    console.log('✓ Admin user created successfully:', admin.email);
    console.log('  Email:', adminEmail);
    console.log('  Password:', adminPassword);
    console.log('  Name:', `${adminFirstName} ${adminLastName}`);
  } catch (error) {
    console.error('✗ Error seeding admin:', error.message);
    if (error.name === 'SequelizeConnectionError') {
      console.error('  Database connection failed. Please ensure:');
      console.error('  1. MySQL server is running');
      console.error('  2. Database credentials in .env are correct');
      console.error('  3. Database exists (create it manually if needed)');
    }
    // Don't throw - let app.js handle the error gracefully
    // Only throw if called directly (for CLI usage)
    if (require.main === module) {
      throw error;
    }
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('Seeder completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}

module.exports = seedAdmin;

