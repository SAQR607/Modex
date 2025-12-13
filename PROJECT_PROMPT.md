Project Name

Modex Competition Platform

Project Goal

Build a production-ready full-stack web application for Modex Academy to manage multi-stage competitions for CFO candidates. The platform must support qualification filtering, team formation, real-time communication, admin-controlled competitions, and scalable architecture.

⚙️ TECH STACK (MANDATORY)
Backend

Node.js (LTS)

Express.js

MySQL (external – NOT embedded)

Sequelize ORM

JWT Authentication

bcrypt for password hashing

Socket.io for real-time chat

WebRTC (peer-to-peer, team rooms only)

Multer for file uploads

dotenv for configuration

Role-based access control (RBAC)

Frontend

React (JavaScript, NOT TypeScript)

React Router

Axios

Context API (Auth)

Simple clean UI (no heavy UI libraries)

English language only

Deployment Target

Hostinger Cloud Startup

Node.js backend

MySQL database

Frontend built and served separately

GitHub-ready structure

📁 PROJECT STRUCTURE (STRICT)
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
│   │   └── App.js
│   └── package.json
│
└── README.md

🔐 AUTHENTICATION & ROLES
Roles

admin

judge

leader

member

Rules

One account per email

Email + password login only

JWT-based auth

Role middleware enforced on all routes

👤 ADMIN (SUPER USER)

Admin must be auto-created using a Seeder.

Default Admin

Email: admin@financialmodex.com

Password: Admin@123

Role: admin

Seeder must:

Run safely (no duplicates)

Execute on server start

🏆 COMPETITIONS SYSTEM
Features

Multiple competitions supported

Each competition has:

Name

Description

Banner image (sponsors)

Status (draft / active / finished)

Stages

📝 QUALIFICATION PHASE

Admin creates qualification questions

Question types:

Text

Multiple choice

File upload

Users must answer all questions before eligibility

Admin manually approves qualified users

Qualified users are limited (default 100 but configurable)

👥 TEAM SYSTEM

Each qualified user becomes a Team Leader

Team size: max 5 members including leader

Leader generates invite code

Invite code expires when team is full

Incomplete teams are automatically disqualified before competition starts

Leader can assign roles inside team

💬 REAL-TIME COMMUNICATION
Global Chat

All participants (500+)

Text only

No voice or video

Team Chat

Private room per team

Text chat

File uploads (max 65MB)

Allowed file types:

PDF

Excel

CSV

Images

🎧 AUDIO & VIDEO (TEAM ONLY)

WebRTC peer-to-peer

One room per team

Up to 5 users

No external APIs

No TURN server (document limitations clearly)

Voice & video disabled in global chat

📊 SCORING & JUDGING

Multiple competition stages

Early stages:

Automatic scoring

Advanced stages:

Judges manually input scores

Judges can:

View submissions

Upload files

Assign scores

Results visible ONLY to admin & judges

Admin manually publishes results

🧑‍⚖️ JUDGES

Exactly 3 judges per competition

Assigned by admin

Judges cannot see each other’s scores

📢 COMMUNICATION TO TEAMS

Admin can:

Send announcements to all teams

Send files to all teams

Send stage instructions

🎨 UI REQUIREMENTS

English only

Clean professional design

Sponsor banners:

Homepage banner (global sponsors)

Competition page banner (specific sponsors)

Responsive layout

🗄️ DATABASE RULES (CRITICAL)

MySQL ONLY

NO SQLite

NO in-memory DB

All credentials via .env

Sequelize models + relations

Auto sync on first run

📄 DOCUMENTATION

README must include:

Local setup instructions

Environment variables

Deployment steps on Hostinger

WebRTC limitations

Admin access info

❗ IMPORTANT CONSTRAINTS

Do NOT use TypeScript

Do NOT embed DB logic inside code

Do NOT skip seeders

Code must be production-ready

Everything must be GitHub deployable

FINAL OUTPUT EXPECTATION

Cursor must:

Generate the full project

Ensure backend runs independently

Ensure frontend connects via API

Ensure admin login works immediately

Ensure database is external and configurable

END OF PROMPT