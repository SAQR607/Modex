# Modex Competition Platform

A production-ready full-stack web application for Modex Academy to manage multi-stage competitions for CFO candidates. The platform supports qualification filtering, team formation, real-time communication, admin-controlled competitions, and scalable architecture.

## Tech Stack

### Backend
- Node.js (LTS)
- Express.js
- MySQL (external database)
- Sequelize ORM
- JWT Authentication
- bcrypt for password hashing
- Socket.io for real-time chat
- WebRTC (peer-to-peer, team rooms only)
- Multer for file uploads
- dotenv for configuration
- Role-based access control (RBAC)

### Frontend
- React (JavaScript)
- React Router
- Axios
- Context API (Auth)
- Vite (build tool)
- Socket.io-client

## Project Structure

```
modex-platform/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── seeders/
│   │   ├── sockets/
│   │   ├── webrtc/
│   │   ├── uploads/
│   │   └── app.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

## ⚠️ Important: Manual Steps Required

**Before starting the application, you MUST manually create the MySQL database:**

```sql
CREATE DATABASE modex_platform;
```

The application will NOT create the database automatically. See `DEPLOYMENT_TODO.md` for complete deployment checklist.

## Local Setup Instructions

### Prerequisites
- Node.js (LTS version)
- MySQL Server
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure your `.env` file with your MySQL credentials:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=modex_platform
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=67108864
UPLOAD_PATH=./uploads

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

5. Create the MySQL database:
```sql
CREATE DATABASE modex_platform;
```

6. Start the backend server:
```bash
npm start
```

The server will:
- Connect to the database
- Create all necessary tables (auto-sync)
- Seed the admin user automatically

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Default Admin Credentials

The admin user is automatically created when the backend starts:

- **Email:** admin@financialmodex.com
- **Password:** Admin@123
- **Role:** admin

## Environment Variables

### Backend (.env)
- `PORT` - Backend server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - MySQL host
- `DB_PORT` - MySQL port (default: 3306)
- `DB_NAME` - MySQL database name
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT token expiration (default: 7d)
- `MAX_FILE_SIZE` - Maximum file upload size in bytes (default: 65MB)
- `UPLOAD_PATH` - Path for uploaded files
- `FRONTEND_URL` - Frontend URL for CORS

## Features

### Authentication & Roles
- JWT-based authentication
- Role-based access control (admin, judge, leader, member)
- One account per email
- Email + password login only

### Competition Management
- Multiple competitions support
- Competition status (draft/active/finished)
- Banner images for sponsors
- Competition stages

### Qualification Phase
- Admin creates qualification questions
- Question types: Text, Multiple Choice, File Upload
- Users must answer all required questions
- Admin manually approves qualified users
- Configurable limit on qualified users (default: 100)

### Team System
- Qualified users become Team Leaders
- Team size: max 5 members (including leader)
- Leader generates invite code
- Invite code expires when team is full
- Incomplete teams automatically disqualified before competition starts
- Leader can assign roles inside team

### Real-Time Communication
- **Global Chat:** All participants (500+), text only
- **Team Chat:** Private room per team, text chat, file uploads (max 65MB)
- Allowed file types: PDF, Excel, CSV, Images

### Audio & Video (Team Only)
- WebRTC peer-to-peer
- One room per team
- Up to 5 users
- No external APIs
- **Note:** No TURN server included (document limitations clearly)

### Scoring & Judging
- Multiple competition stages
- Early stages: Automatic scoring
- Advanced stages: Judges manually input scores
- Judges can view submissions, upload files, assign scores
- Results visible ONLY to admin & judges
- Admin manually publishes results
- Exactly 3 judges per competition

### Communication to Teams
- Admin can send announcements to all teams
- Admin can send files to all teams
- Admin can send stage instructions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)

### Competitions
- `GET /api/competitions` - Get all competitions
- `GET /api/competitions/:id` - Get competition details
- `POST /api/competitions` - Create competition (admin only)
- `PUT /api/competitions/:id` - Update competition (admin only)
- `DELETE /api/competitions/:id` - Delete competition (admin only)

### Qualifications
- `GET /api/qualifications/questions/:competitionId` - Get qualification questions
- `POST /api/qualifications/answers/:competitionId` - Submit answers
- `POST /api/qualifications/upload` - Upload qualification file
- `GET /api/qualifications/answers/:competitionId` - Get all answers (admin only)
- `POST /api/qualifications/approve/:userId` - Approve user (admin only)

### Teams
- `POST /api/teams` - Create team
- `POST /api/teams/join` - Join team with invite code
- `GET /api/teams/my-team` - Get user's team
- `PUT /api/teams/assign-role` - Assign team role (leader only)
- `GET /api/teams/competition/:competitionId` - Get teams for competition
- `POST /api/teams/disqualify/:competitionId` - Disqualify incomplete teams (admin only)

### Stages
- `GET /api/stages/:competitionId` - Get stages for competition
- `POST /api/stages` - Create stage (admin only)
- `PUT /api/stages/:id` - Update stage (admin only)
- `DELETE /api/stages/:id` - Delete stage (admin only)

### Submissions
- `POST /api/submissions` - Create submission
- `GET /api/submissions/stage/:stageId` - Get submissions for stage (admin/judge)
- `GET /api/submissions/my-submission/:stageId` - Get team's submission

### Judges
- `POST /api/judges/assign` - Assign judge to competition (admin only)
- `GET /api/judges/:competitionId` - Get judges for competition
- `POST /api/judges/score` - Score submission (judge only)
- `GET /api/judges/submissions/:competitionId/:stageId` - Get submissions for judging

### Announcements
- `POST /api/announcements` - Create announcement (admin only)
- `GET /api/announcements/:competitionId` - Get announcements for competition

## WebRTC Limitations

The current WebRTC implementation uses peer-to-peer connections only. This means:

1. **No TURN Server:** Users behind strict NAT/firewalls may experience connection issues
2. **Direct Connections Only:** Works best when all participants are on the same network or have public IPs
3. **Production Recommendation:** For production use, consider implementing a TURN server (e.g., using services like Twilio, AWS Kinesis Video Streams, or self-hosted solutions like coturn)

## Deployment Checklist

### ⚠️ MANUAL STEPS REQUIRED (Cannot be automated)

Before deploying, you MUST complete these steps manually:

1. **Create MySQL Database**
   ```sql
   CREATE DATABASE modex_platform;
   ```
   - This must be done manually via MySQL client or hosting panel
   - Database will NOT be created automatically

2. **Create Production .env File**
   - Copy `.env.example` to `.env` in backend directory
   - Fill in all production values:
     - Database credentials (from hosting panel)
     - JWT_SECRET (generate strong random string)
     - FRONTEND_URL (your production frontend URL)
     - NODE_ENV=production

3. **Configure Hosting Panel**
   - Set up MySQL database in hosting panel
   - Note database host, port, name, user, password
   - Ensure Node.js is enabled for your hosting plan

4. **Configure Domain/DNS** (if applicable)
   - Point domain to hosting server
   - Configure SSL/HTTPS certificates
   - Set up reverse proxy if needed

5. **File Permissions**
   - Ensure `uploads` directory has write permissions
   - Check that Node.js process can write to uploads folder

### Automated Steps (Code handles these)

- Database tables creation (via Sequelize sync)
- Admin user seeding
- Application startup

## Deployment on Hostinger Cloud Startup

### Backend Deployment

1. **Prepare the backend:**
   - Ensure all dependencies are in `package.json`
   - Set `NODE_ENV=production` in `.env`
   - Update database credentials for production MySQL
   - Update `FRONTEND_URL` to your production frontend URL

2. **Upload files:**
   - Upload the `backend` folder to your Hostinger server
   - Use SSH or FTP to transfer files

3. **Install dependencies:**
   ```bash
   cd backend
   npm install --production
   ```

4. **Set up environment:**
   - Create `.env` file with production values
   - Ensure MySQL database is created and accessible

5. **Start the server:**
   - Use PM2 or similar process manager:
   ```bash
   npm install -g pm2
   pm2 start src/app.js --name modex-backend
   pm2 save
   pm2 startup
   ```

### Frontend Deployment

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload build files:**
   - Upload the contents of `frontend/dist` to your web server
   - Configure your web server to serve the built files

3. **Update API URL:**
   - Update `VITE_API_URL` in frontend build or configure reverse proxy

### Database Setup

1. Create MySQL database on Hostinger
2. Update `.env` with production database credentials
3. Run the backend - tables will be created automatically
4. Admin user will be seeded automatically

### File Uploads

- Ensure `uploads` directory exists and has write permissions
- Configure path in `.env` (`UPLOAD_PATH`)
- For production, consider using cloud storage (AWS S3, etc.)

## Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

**Frontend:**
```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist`

## Security Notes

1. **JWT Secret:** Change `JWT_SECRET` in production to a strong, random string
2. **Database Password:** Use strong passwords for production database
3. **CORS:** Configure `FRONTEND_URL` correctly for production
4. **File Uploads:** Validate file types and sizes on both client and server
5. **Environment Variables:** Never commit `.env` files to version control

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE modex_platform;`

### Admin User Not Created
- Check database connection
- Verify seeder runs on server start
- Check console logs for errors

### File Upload Issues
- Ensure `uploads` directory exists
- Check file permissions
- Verify `MAX_FILE_SIZE` in `.env`

### WebRTC Connection Issues
- Check if users are behind NAT/firewalls
- Consider implementing TURN server for production
- Verify Socket.io connection is established

## License

ISC

## Support

For issues or questions, please refer to the project documentation or contact the development team.

