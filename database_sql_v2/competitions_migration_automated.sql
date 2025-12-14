-- ============================================
-- Competitions Table Migration (Automated/Idempotent)
-- Uses stored procedure for safe, automated migration
-- Compatible with MySQL 8+ (Hostinger)
-- Safe to run multiple times
-- ============================================

DELIMITER $$

-- Drop procedure if it exists (for re-running)
DROP PROCEDURE IF EXISTS migrate_competitions_table$$

CREATE PROCEDURE migrate_competitions_table()
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    DECLARE table_exists INT DEFAULT 0;
    
    -- Check if table exists
    SELECT COUNT(*) INTO table_exists
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'competitions';
    
    -- If table doesn't exist, create it
    IF table_exists = 0 THEN
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
        
        SELECT 'Table created successfully' AS result;
    ELSE
        -- Handle 'name' column
        SELECT COUNT(*) INTO column_exists
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'competitions'
          AND COLUMN_NAME = 'name';
        
        IF column_exists = 0 THEN
            -- Check if 'title' exists to rename it
            SELECT COUNT(*) INTO column_exists
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'competitions'
              AND COLUMN_NAME = 'title';
            
            IF column_exists > 0 THEN
                ALTER TABLE `competitions` 
                  CHANGE COLUMN `title` `name` VARCHAR(255) NOT NULL;
                SELECT 'Renamed title to name' AS result;
            ELSE
                ALTER TABLE `competitions` 
                  ADD COLUMN `name` VARCHAR(255) NOT NULL FIRST;
                SELECT 'Added name column' AS result;
            END IF;
        END IF;
        
        -- Handle 'max_qualified_users' column
        SELECT COUNT(*) INTO column_exists
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'competitions'
          AND COLUMN_NAME = 'max_qualified_users';
        
        IF column_exists = 0 THEN
            -- Check if 'maxTeams' exists to rename it
            SELECT COUNT(*) INTO column_exists
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'competitions'
              AND COLUMN_NAME = 'maxTeams';
            
            IF column_exists > 0 THEN
                ALTER TABLE `competitions` 
                  CHANGE COLUMN `maxTeams` `max_qualified_users` INT UNSIGNED NULL DEFAULT 100;
                SELECT 'Renamed maxTeams to max_qualified_users' AS result;
            ELSE
                ALTER TABLE `competitions` 
                  ADD COLUMN `max_qualified_users` INT UNSIGNED NULL DEFAULT 100 AFTER `status`;
                SELECT 'Added max_qualified_users column' AS result;
            END IF;
        END IF;
        
        -- Handle 'banner_image' column
        SELECT COUNT(*) INTO column_exists
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'competitions'
          AND COLUMN_NAME = 'banner_image';
        
        IF column_exists = 0 THEN
            ALTER TABLE `competitions` 
              ADD COLUMN `banner_image` VARCHAR(255) NULL AFTER `max_qualified_users`;
            SELECT 'Added banner_image column' AS result;
        END IF;
        
        -- Handle 'created_at' column
        SELECT COUNT(*) INTO column_exists
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'competitions'
          AND COLUMN_NAME = 'created_at';
        
        IF column_exists = 0 THEN
            -- Check if 'createdAt' exists to rename it
            SELECT COUNT(*) INTO column_exists
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'competitions'
              AND COLUMN_NAME = 'createdAt';
            
            IF column_exists > 0 THEN
                ALTER TABLE `competitions` 
                  CHANGE COLUMN `createdAt` `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
                SELECT 'Renamed createdAt to created_at' AS result;
            ELSE
                ALTER TABLE `competitions` 
                  ADD COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
                SELECT 'Added created_at column' AS result;
            END IF;
        END IF;
        
        -- Handle 'updated_at' column
        SELECT COUNT(*) INTO column_exists
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'competitions'
          AND COLUMN_NAME = 'updated_at';
        
        IF column_exists = 0 THEN
            -- Check if 'updatedAt' exists to rename it
            SELECT COUNT(*) INTO column_exists
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'competitions'
              AND COLUMN_NAME = 'updatedAt';
            
            IF column_exists > 0 THEN
                ALTER TABLE `competitions` 
                  CHANGE COLUMN `updatedAt` `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
                SELECT 'Renamed updatedAt to updated_at' AS result;
            ELSE
                ALTER TABLE `competitions` 
                  ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
                SELECT 'Added updated_at column' AS result;
            END IF;
        END IF;
        
        SELECT 'Migration completed successfully' AS result;
    END IF;
END$$

DELIMITER ;

-- Run the migration procedure
CALL migrate_competitions_table();

-- Clean up: Drop the procedure after use
DROP PROCEDURE IF EXISTS migrate_competitions_table;

-- Verify final structure
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

