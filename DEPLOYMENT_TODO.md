# Deployment TODO - Manual Steps Required

This document lists all manual steps that must be completed before deployment. These steps cannot be automated and require manual intervention.

## Pre-Deployment Checklist

### 1. Database Setup ⚠️ MANUAL
- [ ] Access MySQL via hosting panel or MySQL client
- [ ] Create database: `CREATE DATABASE modex_platform;`
- [ ] Note database credentials (host, port, name, user, password)
- [ ] Verify database user has proper permissions (SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER)

### 2. Environment Configuration ⚠️ MANUAL
- [ ] Create `.env` file in `backend/` directory
- [ ] Copy values from `.env.example` and fill in:
  - [ ] `DB_HOST` - MySQL host from hosting panel
  - [ ] `DB_PORT` - MySQL port (usually 3306)
  - [ ] `DB_NAME` - Database name (modex_platform)
  - [ ] `DB_USER` - Database username
  - [ ] `DB_PASSWORD` - Database password
  - [ ] `JWT_SECRET` - Generate strong random string (e.g., `openssl rand -base64 32`)
  - [ ] `FRONTEND_URL` - Production frontend URL (e.g., `https://yourdomain.com`)
  - [ ] `NODE_ENV=production`
  - [ ] `PORT` - Backend port (check hosting requirements)

### 3. File System Setup ⚠️ MANUAL
- [ ] Create `backend/uploads/` directory on server
- [ ] Set write permissions: `chmod 755 backend/uploads` (or via hosting panel)
- [ ] Verify Node.js process can write to uploads directory

### 4. Hosting Panel Configuration ⚠️ MANUAL
- [ ] Enable Node.js for your hosting plan
- [ ] Configure Node.js version (LTS recommended)
- [ ] Set up process manager (PM2, systemd, or hosting panel's process manager)
- [ ] Configure reverse proxy if needed (nginx, Apache)
- [ ] Set up SSL/HTTPS certificate
- [ ] Configure domain DNS if using custom domain

### 5. Security Configuration ⚠️ MANUAL
- [ ] Generate strong JWT_SECRET (never use default)
- [ ] Review and restrict CORS origins in production
- [ ] Configure firewall rules if applicable
- [ ] Set up database backup schedule
- [ ] Review file upload size limits

### 6. Frontend Build & Deployment ⚠️ MANUAL
- [ ] Update `frontend/src/services/api.js` with production API URL
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Upload `frontend/dist/` contents to web server
- [ ] Configure web server to serve static files
- [ ] Set up routing for SPA (all routes to index.html)

### 7. Testing After Deployment ⚠️ MANUAL
- [ ] Test admin login (admin@financialmodex.com / Admin@123)
- [ ] Verify database connection works
- [ ] Test file uploads
- [ ] Test real-time chat functionality
- [ ] Test WebRTC (note: may have NAT limitations)
- [ ] Verify all API endpoints are accessible
- [ ] Check error logs for any issues

### 8. Post-Deployment ⚠️ MANUAL
- [ ] Set up monitoring/logging (if available)
- [ ] Configure automatic restarts (PM2, systemd)
- [ ] Set up database backups
- [ ] Document production URLs and credentials (securely)
- [ ] Change default admin password (recommended)

## Notes

- **Database**: The application will NOT create the database automatically. You must create it manually.
- **Admin User**: Will be created automatically on first server start if database is accessible.
- **WebRTC**: May not work for users behind strict NAT/firewalls without TURN server (not included).
- **File Uploads**: Ensure sufficient disk space and proper permissions.

## Support

If you encounter issues during deployment:
1. Check server logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database is accessible and credentials are correct
4. Check file permissions on uploads directory
5. Verify Node.js version compatibility

