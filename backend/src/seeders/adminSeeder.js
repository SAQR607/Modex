const { User } = require('../models');
const sequelize = require('../config/database');

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@financialmodex.com';
    const adminPassword = 'Admin@123';

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log('✓ Admin user already exists. Skipping creation.');
      return;
    }

    const admin = await User.create({
      email: adminEmail,
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isQualified: true
    });

    console.log('✓ Admin user created successfully:', admin.email);
    console.log('  Email:', adminEmail);
    console.log('  Password:', adminPassword);
  } catch (error) {
    console.error('✗ Error seeding admin:', error.message);
    if (error.name === 'SequelizeConnectionError') {
      console.error('  Database connection failed. Please ensure:');
      console.error('  1. MySQL server is running');
      console.error('  2. Database credentials in .env are correct');
      console.error('  3. Database "modex_platform" exists (create it manually)');
    }
    throw error;
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

