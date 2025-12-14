# Competitions Table Fix Guide

## Problem Identified

The "Create Competition" functionality was failing silently due to field name mismatches between:
- **Frontend form** (sends: `name`, `maxQualifiedUsers`, `bannerImage`)
- **Backend controller** (expects: `name`, `maxQualifiedUsers`, `bannerImage`) ✓
- **Sequelize model** (had: `title`, `maxTeams`, missing `bannerImage`) ❌

## Changes Made

### 1. Updated Sequelize Model (`backend/src/models/Competition.js`)

**Before:**
- `title` → **Changed to:** `name`
- `maxTeams` → **Changed to:** `maxQualifiedUsers`
- Missing `bannerImage` → **Added:** `bannerImage`
- Table name: `Competitions` → **Changed to:** `competitions` (lowercase, MySQL convention)
- Timestamps: `createdAt`/`updatedAt` → **Changed to:** `created_at`/`updated_at` (snake_case)

**After:**
- `name` (VARCHAR 255, NOT NULL)
- `description` (TEXT, nullable)
- `status` (ENUM: 'draft', 'active', 'completed', default: 'draft')
- `maxQualifiedUsers` (INT, nullable, default: 100) - maps to `max_qualified_users` in DB
- `bannerImage` (VARCHAR 255, nullable) - maps to `banner_image` in DB
- `created_at` and `updated_at` timestamps

### 2. Database Migration Options

You have three options to update your database:

#### Option A: Automated Migration (Recommended - Easiest & Safest)

Use `competitions_migration_automated.sql` - This uses a stored procedure that automatically checks for column existence before making changes. It's completely safe to run multiple times.

1. **Backup your database first!**
2. Open phpMyAdmin → SQL tab
3. Copy and paste the entire `competitions_migration_automated.sql` file
4. Click "Go"
5. The script will automatically:
   - Check what columns exist
   - Rename or add columns as needed
   - Skip steps that are already complete
   - Show you what actions were taken

**This is the recommended approach** - it handles all edge cases automatically.

#### Option B: Manual Step-by-Step Migration (If Option A doesn't work)

Use `competitions_migration_safe.sql` - This provides step-by-step instructions with checks:

1. **Backup your database first!**
2. Open phpMyAdmin → SQL tab
3. Run the migration script section by section:
   - If your table is named `Competitions` (uppercase), rename it to `competitions` first
   - Rename `title` → `name`
   - Rename `maxTeams` → `max_qualified_users` (or add if missing)
   - Add `banner_image` column (if it doesn't exist)
   - Update timestamp column names if needed

**Note:** Some ALTER TABLE commands may fail if columns don't exist. That's okay - just skip those steps.

#### Option C: Recreate Table (Faster - Deletes All Data)

Use `competitions.sql` to drop and recreate the table:

1. **Backup your database first!**
2. Open phpMyAdmin → SQL tab
3. Run `competitions.sql`
4. This will delete all existing competition data

## Verification Steps

After applying the migration:

1. **Check Model Matches Database:**
   ```sql
   DESCRIBE competitions;
   ```
   Should show:
   - `name` (not `title`)
   - `max_qualified_users` (not `maxTeams`)
   - `banner_image` (exists)
   - `created_at` and `updated_at` (not `createdAt`/`updatedAt`)

2. **Test Frontend:**
   - Log in as admin
   - Navigate to "Create New Competition"
   - Fill out the form and submit
   - Should successfully create the competition

3. **Check Backend Logs:**
   - No Sequelize errors about missing columns
   - Competition created successfully

## Field Mapping Summary

| Frontend/Controller | Sequelize Model | Database Column |
|---------------------|-----------------|-----------------|
| `name` | `name` | `name` |
| `description` | `description` | `description` |
| `maxQualifiedUsers` | `maxQualifiedUsers` | `max_qualified_users` |
| `bannerImage` | `bannerImage` | `banner_image` |
| - | `status` | `status` |
| - | `id` | `id` |
| - | `created_at` | `created_at` |
| - | `updated_at` | `updated_at` |

## Troubleshooting

### Error: "Column 'title' doesn't exist"
- The migration to rename `title` → `name` may have failed
- Check if the column is actually named `title` or `name` in phpMyAdmin
- Manually rename: `ALTER TABLE competitions CHANGE COLUMN title name VARCHAR(255) NOT NULL;`

### Error: "Column 'maxTeams' doesn't exist"
- The column might already be named `max_qualified_users` or doesn't exist
- Check the table structure in phpMyAdmin
- If missing, add: `ALTER TABLE competitions ADD COLUMN max_qualified_users INT UNSIGNED NULL DEFAULT 100;`

### Error: "Duplicate column name 'banner_image'"
- The column already exists - this is fine, skip that step

### Competition Still Fails to Create
- Check backend logs for Sequelize errors
- Verify the table name is `competitions` (lowercase)
- Ensure all required columns exist with correct data types
- Clear any cached Sequelize model definitions (restart server)

## Next Steps

1. Apply the database migration
2. Restart your backend server
3. Test creating a competition from the frontend
4. Verify the competition appears in the database with correct field values

