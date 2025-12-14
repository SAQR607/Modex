-- ============================================
-- Competitions Table Schema
-- Compatible with MySQL 8+ (Hostinger)
-- ============================================

-- Drop existing competitions table if it exists
-- WARNING: This will delete all existing competition data
DROP TABLE IF EXISTS `competitions`;

-- Create competitions table matching the Sequelize model
CREATE TABLE `competitions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('draft', 'active', 'completed') NOT NULL DEFAULT 'draft',
  `max_qualified_users` INT UNSIGNED NULL DEFAULT 100,
  `banner_image` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table created successfully
-- ============================================

