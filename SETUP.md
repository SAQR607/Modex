# Quick Setup Guide

## Prerequisites
- Node.js (LTS version) installed
- MySQL Server running
- npm or yarn package manager

## Step-by-Step Setup

### 1. Database Setup
```sql
CREATE DATABASE modex_platform;
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=modex_platform
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=67108864
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
npm start
```

The admin user will be automatically created:
- Email: admin@financialmodex.com
- Password: Admin@123

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:3000

## Testing the Setup

1. Open http://localhost:3000
2. Login with admin credentials
3. Create a competition
4. Add qualification questions
5. Register a new user and complete qualification
6. Approve the user (as admin)
7. Create/join a team

## Troubleshooting

- **Database connection error**: Check MySQL is running and credentials in `.env`
- **Port already in use**: Change PORT in `.env` or kill the process using the port
- **Module not found**: Run `npm install` in both backend and frontend directories
- **Admin not created**: Check database connection and console logs

