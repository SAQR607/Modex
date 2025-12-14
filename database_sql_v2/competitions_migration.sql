-- ============================================
-- Competitions Table Migration
-- Updates existing table to match Sequelize model
-- Compatible with MySQL 8+ (Hostinger)
-- ============================================

-- This migration updates the competitions table to match the frontend/backend expectations
-- Run this if you have an existing competitions table that needs updating

-- Step 1: Rename 'title' column to 'name' (if it exists)
ALTER TABLE `competitions` 
  CHANGE COLUMN `title` `name` VARCHAR(255) NOT NULL;

-- If the table uses uppercase 'Competitions', uncomment this instead:
-- ALTER TABLE `Competitions` 
--   CHANGE COLUMN `title` `name` VARCHAR(255) NOT NULL;

-- Step 2: Rename 'maxTeams' to 'max_qualified_users' (if it exists)
-- First, check if maxTeams exists, if so rename it
ALTER TABLE `competitions` 
  CHANGE COLUMN `maxTeams` `max_qualified_users` INT UNSIGNED NULL DEFAULT 100;

-- If maxTeams doesn't exist, add the new column
-- ALTER TABLE `competitions` 
--   ADD COLUMN `max_qualified_users` INT UNSIGNED NULL DEFAULT 100 AFTER `status`;

-- Step 3: Add 'banner_image' column if it doesn't exist
-- Check if column exists first, then add if needed
-- If you get "Duplicate column name" error, the column already exists - skip this step
ALTER TABLE `competitions` 
  ADD COLUMN `banner_image` VARCHAR(255) NULL AFTER `max_qualified_users`;

-- Step 4: Ensure table name is lowercase 'competitions'
-- If your table is named 'Competitions' (uppercase), rename it:
-- RENAME TABLE `Competitions` TO `competitions`;

-- Step 5: Verify timestamps are correctly named
ALTER TABLE `competitions` 
  CHANGE COLUMN `createdAt` `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN `updatedAt` `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- If createdAt/updatedAt don't exist, add them:
-- ALTER TABLE `competitions` 
--   ADD COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ============================================
-- Migration completed
-- ============================================

