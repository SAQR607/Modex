# Database Schema Recreation Guide

This folder contains SQL files to recreate database tables with the correct schema matching the frontend expectations.

## Problem Solved

The frontend sends `firstName` and `lastName` during registration, but the database table was using `fullName`. This caused silent registration failures.

## Files

- `users.sql` - SQL script to recreate the users table with `first_name` and `last_name` columns
- `competitions.sql` - SQL script to recreate the competitions table with correct field names (`name`, `max_qualified_users`, `banner_image`)

## Step-by-Step Instructions

### 1. Backup Your Database (IMPORTANT)

Before proceeding, **backup your database** via phpMyAdmin:
1. Log into phpMyAdmin on Hostinger
2. Select your database
3. Click "Export" tab
4. Choose "Quick" export method
5. Click "Go" to download the backup

### 2. Drop Existing Tables Safely

**Option A: Via phpMyAdmin (Recommended)**
1. Log into phpMyAdmin
2. Select your database from the left sidebar
3. Find the `users` table
4. Click the checkbox next to `users`
5. Click "Drop" at the bottom
6. Confirm the deletion

**Option B: Via SQL (Advanced)**
1. Go to phpMyAdmin → SQL tab
2. Run this command:
   ```sql
   DROP TABLE IF EXISTS `users`;
   ```

### 3. Import the New Schema

1. In phpMyAdmin, select your database
2. Click the "Import" tab
3. Click "Choose File" and select `users.sql`
4. Ensure "Format" is set to "SQL"
5. Click "Go" at the bottom
6. Wait for the success message

### 4. Verify Table Structure

After import, verify the table structure:
1. Click on the `users` table in phpMyAdmin
2. Click the "Structure" tab
3. Verify these columns exist:
   - `id` (INT, Primary Key, Auto Increment)
   - `first_name` (VARCHAR 100, NOT NULL)
   - `last_name` (VARCHAR 100, NOT NULL)
   - `email` (VARCHAR 255, UNIQUE, NOT NULL)
   - `password` (VARCHAR 255, NOT NULL)
   - `role` (ENUM: 'user', 'admin', DEFAULT 'user')
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

### 5. Create an Admin User Manually

After recreating the table, you'll need to create an admin user manually.

**Option A: Via phpMyAdmin Insert**
1. Click on the `users` table
2. Click the "Insert" tab
3. Fill in the form:
   - `first_name`: `Admin`
   - `last_name`: `User`
   - `email`: `admin@modex.local` (or your preferred admin email)
   - `password`: `$2b$10$...` (bcrypt hashed password)
   - `role`: `admin`
4. Click "Go"

**Option B: Via SQL (Generate Password Hash First)**

First, generate a bcrypt hash for your password. You can use Node.js:
```javascript
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('YourPassword123!', 10);
console.log(hash);
```

Then run this SQL in phpMyAdmin (SQL tab):
```sql
INSERT INTO `users` (`first_name`, `last_name`, `email`, `password`, `role`)
VALUES (
  'Admin',
  'User',
  'admin@modex.local',
  '$2b$10$YOUR_BCRYPT_HASH_HERE',
  'admin'
);
```

**Option C: Use Temporary Admin Login**

If you have the temporary admin login configured in `authController.js` (`admin@modex.local` / `Admin123!`), you can use that to log in and create users through the application.

## Troubleshooting

### Error: "Table already exists"
- Make sure you dropped the old table first (Step 2)

### Error: "Access denied"
- Verify you have the correct database user permissions
- Check that you're logged into phpMyAdmin with the correct account

### Error: "Syntax error"
- Ensure you're using MySQL 8+ compatible syntax
- Check that the SQL file encoding is UTF-8

### Registration Still Fails After Import
- Verify the table structure matches exactly (Step 4)
- Check that your backend Sequelize User model matches the new schema
- Clear any cached database connections

## Next Steps

After successfully importing the schema:
1. Test user registration from the frontend
2. Verify that `firstName` and `lastName` are saved correctly
3. Remove the temporary admin login from `authController.js` if no longer needed

## Support

If you encounter issues:
1. Check phpMyAdmin error messages
2. Verify environment variables (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)
3. Review backend logs for Sequelize errors


