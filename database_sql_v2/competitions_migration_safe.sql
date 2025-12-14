-- ============================================
-- Competitions Table Migration (Idempotent/Safe)
-- Updates existing table to match Sequelize model
-- Compatible with MySQL 8+ (Hostinger)
-- Safe to run multiple times - checks before altering
-- ============================================

-- Step 1: Check current table structure
-- Run this first to see what columns exist:
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'competitions'
ORDER BY 
    ORDINAL_POSITION;

-- ============================================
-- Step 2: Ensure table name is lowercase 'competitions'
-- ============================================
-- If your table is named 'Competitions' (uppercase), uncomment and run this:
-- RENAME TABLE `Competitions` TO `competitions`;

-- ============================================
-- Step 3: Handle 'name' column
-- ============================================
-- Check if 'name' column exists, if not, add it or rename from 'title'

-- Option A: If 'title' exists and 'name' doesn't, rename it
-- Run this ONLY if you see 'title' in the structure check above:
ALTER TABLE `competitions` 
  CHANGE COLUMN `title` `name` VARCHAR(255) NOT NULL;

-- Option B: If neither 'title' nor 'name' exists, add 'name'
-- Run this ONLY if you don't see either 'title' or 'name' in the structure check:
-- ALTER TABLE `competitions` 
--   ADD COLUMN `name` VARCHAR(255) NOT NULL FIRST;

-- ============================================
-- Step 4: Handle 'max_qualified_users' column
-- ============================================
-- Check if 'max_qualified_users' exists, if not, add it or rename from 'maxTeams'

-- Option A: If 'maxTeams' exists and 'max_qualified_users' doesn't, rename it
-- Run this ONLY if you see 'maxTeams' in the structure check above:
ALTER TABLE `competitions` 
  CHANGE COLUMN `maxTeams` `max_qualified_users` INT UNSIGNED NULL DEFAULT 100;

-- Option B: If 'max_qualified_users' doesn't exist and 'maxTeams' doesn't exist, add it
-- Run this ONLY if you don't see either column in the structure check:
-- ALTER TABLE `competitions` 
--   ADD COLUMN `max_qualified_users` INT UNSIGNED NULL DEFAULT 100 AFTER `status`;

-- ============================================
-- Step 5: Handle 'banner_image' column
-- ============================================
-- Add 'banner_image' if it doesn't exist
-- This will fail with "Duplicate column" if it already exists - that's okay, just ignore the error

ALTER TABLE `competitions` 
  ADD COLUMN `banner_image` VARCHAR(255) NULL AFTER `max_qualified_users`;

-- If you get "Duplicate column name 'banner_image'", the column already exists - skip this step

-- ============================================
-- Step 6: Handle timestamp columns
-- ============================================
-- Rename timestamp columns to snake_case if they exist in camelCase

-- If 'createdAt' exists, rename to 'created_at'
ALTER TABLE `competitions` 
  CHANGE COLUMN `createdAt` `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- If 'updatedAt' exists, rename to 'updated_at'
ALTER TABLE `competitions` 
  CHANGE COLUMN `updatedAt` `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- If you get "Unknown column" errors, the columns are already correctly named - skip those steps

-- ============================================
-- Step 7: Verify final structure
-- ============================================
-- Run this to verify the table structure matches the model:
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    COLUMN_KEY
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'competitions'
ORDER BY 
    ORDINAL_POSITION;

-- Expected columns:
-- id (INT, PRIMARY KEY, AUTO_INCREMENT)
-- name (VARCHAR 255, NOT NULL)
-- description (TEXT, NULLABLE)
-- status (ENUM, NOT NULL, DEFAULT 'draft')
-- max_qualified_users (INT, NULLABLE, DEFAULT 100)
-- banner_image (VARCHAR 255, NULLABLE)
-- created_at (TIMESTAMP, NOT NULL)
-- updated_at (TIMESTAMP, NOT NULL)

-- ============================================
-- Migration completed
-- ============================================

