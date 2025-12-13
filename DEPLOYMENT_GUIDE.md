# Hostinger Deployment Guide

This guide explains how to deploy the Modex Competition Platform on Hostinger Cloud Startup.

## ⚠️ Important: Deployment Sequence

**Hostinger requires the site to be deployed BEFORE database creation.** Follow this exact sequence:

1. Deploy code first (without database)
2. Create database in hosting panel
3. Configure .env file
4. Restart application

## Prerequisites

- Hostinger Cloud Startup account
- Node.js enabled in hosting panel
- MySQL database access in hosting panel
- FTP/SSH access to server

## Phase 1: Initial Deployment (Without Database)

### Step 1: Prepare Code for Upload

1. **Build Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   This creates `frontend/dist/` directory with production files.

2. **Prepare Backend:**
   ```bash
   cd backend
   npm install --production
   ```
   Ensure `node_modules` is ready (but don't upload it - install on server).

### Step 2: Upload Files to Hostinger

**Backend Files to Upload:**
- `backend/src/` (entire directory)
- `backend/package.json`
- `backend/.env.example` (rename to `.env` later)
- `backend/uploads/` (create empty directory)

**Frontend Files to Upload:**
- `frontend/dist/` (entire contents, not the folder itself)
- Upload to your web root (usually `public_html` or `www`)

### Step 3: Configure Server

1. **SSH into your Hostinger server** (or use File Manager)

2. **Navigate to backend directory:**
   ```bash
   cd /path/to/backend
   ```

3. **Install dependencies:**
   ```bash
   npm install --production
   ```

4. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

5. **Edit .env with temporary values** (database will be created next):
   ```env
   PORT=5000
   NODE_ENV=production
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=modex_platform
   DB_USER=placeholder
   DB_PASSWORD=placeholder
   JWT_SECRET=generate-strong-random-string
   JWT_EXPIRES_IN=7d
   MAX_FILE_SIZE=67108864
   UPLOAD_PATH=./uploads
   FRONTEND_URL=https://yourdomain.com
   ```

6. **Create uploads directory:**
   ```bash
   mkdir -p uploads
   chmod 755 uploads
   ```

7. **Start the server** (it will run without database):
   ```bash
   # Using PM2 (recommended)
   npm install -g pm2
   pm2 start src/app.js --name modex-backend
   pm2 save
   pm2 startup
   
   # Or using Node directly
   node src/app.js
   ```

**Expected Output:**
```
✓ Server running on port 5000
⚠️  Database connection failed. Server is running but database features are unavailable.
📋 Waiting for database configuration after deployment.
```

This is **normal and expected** at this stage.

## Phase 2: Create Database

### Step 1: Access Hosting Panel

1. Log into Hostinger control panel
2. Navigate to **Databases** → **MySQL Databases**
3. Click **Create New Database**

### Step 2: Create Database

1. **Database Name:** `modex_platform` (or your preferred name)
2. **Username:** Create a new user or use existing
3. **Password:** Generate strong password (save it!)
4. **Host:** Usually `localhost` (check hosting panel for exact value)
5. **Port:** Usually `3306` (check hosting panel)

### Step 3: Grant Permissions

Ensure the database user has:
- SELECT
- INSERT
- UPDATE
- DELETE
- CREATE
- ALTER
- INDEX

## Phase 3: Configure Environment Variables

### Step 1: Update .env File

SSH into server and edit `backend/.env`:

```env
PORT=5000
NODE_ENV=production

# Database Configuration (from hosting panel)
DB_HOST=localhost                    # Check hosting panel for exact value
DB_PORT=3306                         # Check hosting panel for exact value
DB_NAME=modex_platform                # Your database name
DB_USER=your_database_user           # Your database username
DB_PASSWORD=your_database_password   # Your database password

# JWT Configuration
JWT_SECRET=your-generated-secret     # Generate: openssl rand -base64 32
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=67108864
UPLOAD_PATH=./uploads

# Frontend URL
FRONTEND_URL=https://yourdomain.com  # Your production frontend URL
```

### Step 2: Generate JWT Secret

On your local machine or server:
```bash
openssl rand -base64 32
```
Copy the output to `JWT_SECRET` in `.env`.

## Phase 4: Restart and Verify

### Step 1: Restart Application

```bash
# If using PM2
pm2 restart modex-backend

# Or stop and start
pm2 stop modex-backend
pm2 start src/app.js --name modex-backend
```

### Step 2: Check Logs

```bash
pm2 logs modex-backend
```

**Expected Output (Success):**
```
✓ Database connection established.
✓ Database synchronized.
✓ Admin user created successfully: admin@financialmodex.com
✓ Server running on port 5000
```

### Step 3: Test API

```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"ok","message":"Modex Platform API is running"}
```

### Step 4: Test Admin Login

1. Open your frontend URL
2. Login with:
   - Email: `admin@financialmodex.com`
   - Password: `Admin@123`

## Phase 5: Frontend Configuration

### Step 1: Update API URL

If frontend is on a different domain/subdomain, update `frontend/.env`:

```env
VITE_API_URL=https://api.yourdomain.com
```

Then rebuild:
```bash
cd frontend
npm run build
```

Upload new `dist/` contents.

### Step 2: Configure Web Server

Ensure your web server (nginx/Apache) is configured to:
- Serve static files from `frontend/dist/`
- Route all requests to `index.html` (for React Router)
- Proxy API requests to backend (if needed)

## Troubleshooting

### Server Won't Start

1. Check Node.js version: `node --version` (should be LTS)
2. Check port availability: `netstat -tulpn | grep 5000`
3. Check logs: `pm2 logs modex-backend`

### Database Connection Fails

1. Verify database exists in hosting panel
2. Check DB_HOST, DB_PORT in .env (may not be "localhost")
3. Verify username/password are correct
4. Check database user permissions
5. Verify firewall allows MySQL connections

### Frontend Can't Connect to API

1. Check CORS settings in backend `.env` (`FRONTEND_URL`)
2. Verify API URL in frontend `.env` (`VITE_API_URL`)
3. Check if backend is running: `pm2 status`
4. Test API directly: `curl http://localhost:5000/api/health`

### File Uploads Not Working

1. Check `uploads/` directory exists
2. Verify permissions: `chmod 755 uploads`
3. Check disk space: `df -h`
4. Verify `UPLOAD_PATH` in `.env`

## Production Checklist

- [ ] Database created and configured
- [ ] .env file configured with production values
- [ ] JWT_SECRET is strong and unique
- [ ] Frontend built and deployed
- [ ] Backend running with PM2 or process manager
- [ ] File uploads directory has write permissions
- [ ] SSL/HTTPS configured
- [ ] CORS configured correctly
- [ ] Admin login tested
- [ ] Database backup schedule configured

## Security Notes

1. **Never commit .env files** to Git
2. **Change default admin password** after first login
3. **Use strong JWT_SECRET** (32+ characters, random)
4. **Enable HTTPS** for production
5. **Restrict database user permissions** to minimum required
6. **Regular backups** of database
7. **Keep dependencies updated**: `npm audit fix`

## Support

If you encounter issues:
1. Check server logs: `pm2 logs modex-backend`
2. Verify all environment variables are set
3. Test database connection manually
4. Check Hostinger documentation for Node.js setup

