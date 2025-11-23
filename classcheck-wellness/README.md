# 🌱 Classcheck Wellness - Student Mental Health Platform

> An AI-powered student wellness platform that helps students track mood, manage stress, and maintain study-life balance.

![Version](https://img.shields.io/badge/version-1.0.0--beta-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 Table of Contents

1. [What is This?](#what-is-this)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Quick Start (For Beginners)](#quick-start-for-beginners)
6. [Detailed Setup Guide](#detailed-setup-guide)
7. [Running the Application](#running-the-application)
8. [Deployment to VPS](#deployment-to-vps)
9. [Project Structure](#project-structure)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)
12. [Support](#support)

---

## 🎯 What is This?

**Classcheck Wellness** is a mental health and wellness platform for students and educators. It helps:

- **Students**: Track mood, manage stress, take study breaks, and access wellness resources
- **Educators**: Monitor class wellness trends and identify students who need support

### Key Features:
- 📊 Daily mood check-ins
- ⏰ Smart break reminders (Pomodoro technique)
- 📈 Wellness dashboard with trends
- 🧘 Meditation and breathing exercises
- 🚨 Crisis support resources
- 👨‍🏫 Educator insights (opt-in)

---

## ✨ Features

### For Students
- ✅ **Daily Mood Tracking** - Quick emoji-based check-ins
- ✅ **Break Reminders** - Prevent burnout with scheduled breaks
- ✅ **Wellness Dashboard** - Visualize mood trends over time
- ✅ **Study Session Timer** - Track study time and breaks
- ✅ **Resource Library** - Meditations, breathing exercises, tips
- ✅ **Crisis Support** - Instant access to mental health hotlines
- ✅ **Privacy Controls** - You control who sees your data

### For Educators
- ✅ **Class Wellness Overview** - See aggregate wellness trends
- ✅ **At-Risk Alerts** - Get notified when students need support
- ✅ **Anonymous Insights** - Respect student privacy
- ✅ **Intervention Tracking** - Log support actions

---

## 🛠️ Tech Stack

This project uses modern, beginner-friendly technologies:

### Frontend
- **React** - User interface library
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling framework
- **Chart.js** - Charts and graphs
- **Zustand** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Prisma** - Database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication

### Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📋 Prerequisites

Before you start, make sure you have these installed on your computer:

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Check version: `node --version`

2. **npm** (comes with Node.js)
   - Check version: `npm --version`

3. **PostgreSQL** (v14 or higher)
   - Download: https://www.postgresql.org/download/
   - Or use Docker (recommended for beginners)

4. **Git**
   - Download: https://git-scm.com/
   - Check version: `git --version`

5. **Docker** (Optional but recommended)
   - Download: https://www.docker.com/get-started
   - Check version: `docker --version`

### Optional (Recommended)
- **VS Code** - Code editor (https://code.visualstudio.com/)
- **Postman** - API testing (https://www.postman.com/)

---

## 🚀 Quick Start (For Beginners)

### Option A: Using Docker (Easiest - Recommended)

If you have Docker installed, this is the fastest way:

```bash
# 1. Clone the repository
git clone https://github.com/themalikmusab/classcheck-wellness.git
cd classcheck-wellness

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start everything with Docker
docker-compose up

# 4. Open your browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
```

**That's it! 🎉** Skip to the [Usage Guide](#usage-guide) section.

### Option B: Manual Setup (More Control)

If you prefer to run things manually or don't have Docker:

```bash
# 1. Clone the repository
git clone https://github.com/themalikmusab/classcheck-wellness.git
cd classcheck-wellness

# 2. Install backend dependencies
cd backend
npm install
cp .env.example .env

# Edit .env file with your database credentials
# (See Detailed Setup Guide below)

# 3. Set up database
npm run db:setup

# 4. Start backend server
npm run dev

# 5. In a NEW terminal, install frontend dependencies
cd ../frontend
npm install
cp .env.example .env

# 6. Start frontend
npm run dev

# 7. Open browser to http://localhost:5173
```

---

## 📚 Detailed Setup Guide

### Step 1: Clone the Repository

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux):

```bash
# Navigate to where you want to store the project
cd ~/Desktop  # or any folder you prefer

# Clone the repository
git clone https://github.com/themalikmusab/classcheck-wellness.git

# Enter the project folder
cd classcheck-wellness
```

### Step 2: Set Up PostgreSQL Database

#### Option A: Using Docker (Easiest)

```bash
# Start PostgreSQL in Docker
docker run --name wellness-db \
  -e POSTGRES_PASSWORD=wellness123 \
  -e POSTGRES_USER=wellness \
  -e POSTGRES_DB=classcheck_wellness \
  -p 5432:5432 \
  -d postgres:15

# Check if it's running
docker ps
```

#### Option B: Using Local PostgreSQL

1. Open PostgreSQL command line:
   ```bash
   # Mac/Linux
   psql -U postgres

   # Windows (use pgAdmin or command prompt)
   psql -U postgres
   ```

2. Create database and user:
   ```sql
   CREATE DATABASE classcheck_wellness;
   CREATE USER wellness WITH PASSWORD 'wellness123';
   GRANT ALL PRIVILEGES ON DATABASE classcheck_wellness TO wellness;
   \q
   ```

### Step 3: Configure Backend

```bash
# Go to backend folder
cd backend

# Install dependencies (this may take a few minutes)
npm install

# Create environment file
cp .env.example .env
```

Now edit the `.env` file with your favorite text editor:

```bash
# Open with VS Code (if installed)
code .env

# Or use any text editor:
# - Windows: notepad .env
# - Mac: open -e .env
# - Linux: nano .env
```

Update these values:

```env
# Database connection (use your PostgreSQL credentials)
DATABASE_URL="postgresql://wellness:wellness123@localhost:5432/classcheck_wellness"

# JWT secret (generate a random string)
JWT_SECRET="your-super-secret-key-change-this-in-production"

# Server port
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

### Step 4: Initialize Database

```bash
# Still in backend folder

# Generate Prisma client
npx prisma generate

# Run database migrations (creates tables)
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npm run seed
```

You should see output like:
```
✔ Generated Prisma Client
✔ Database migration completed
✔ Sample data seeded
```

### Step 5: Configure Frontend

```bash
# Go to frontend folder
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `frontend/.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1

# App name
VITE_APP_NAME="Classcheck Wellness"
```

### Step 6: Verify Installation

Run these commands to make sure everything is installed:

```bash
# Check Node.js
node --version
# Should show: v18.x.x or higher

# Check npm
npm --version
# Should show: 9.x.x or higher

# Check PostgreSQL (if running locally)
psql --version
# Should show: PostgreSQL 14.x or higher

# Check Docker (optional)
docker --version
# Should show: Docker version 20.x.x or higher
```

---

## 🏃 Running the Application

### Development Mode (For Coding)

You need **TWO terminal windows**:

#### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
🗄️  Database connected
```

#### Terminal 2: Frontend Development Server

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application

Open your browser and go to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1/health

### Using Docker Compose (All-in-One)

This starts everything with one command:

```bash
# From project root
docker-compose up

# Or run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

---

## 🌐 Deployment to VPS

Deploy your application to a Virtual Private Server (like DigitalOcean, AWS, Linode).

### Prerequisites on VPS

```bash
# SSH into your VPS
ssh user@your-server-ip

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Deploy Steps

```bash
# 1. Clone repository on VPS
cd /var/www
sudo git clone https://github.com/themalikmusab/classcheck-wellness.git
cd classcheck-wellness

# 2. Configure environment for production
sudo cp backend/.env.example backend/.env
sudo cp frontend/.env.example frontend/.env

# Edit backend/.env (use nano or vim)
sudo nano backend/.env
```

Update for production:

```env
DATABASE_URL="postgresql://wellness:STRONG_PASSWORD_HERE@db:5432/classcheck_wellness"
JWT_SECRET="GENERATE_A_STRONG_RANDOM_SECRET"
NODE_ENV="production"
PORT=3000
FRONTEND_URL="http://your-domain.com"
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://your-domain.com/api/v1
```

```bash
# 3. Build and start with Docker Compose
sudo docker-compose -f docker-compose.prod.yml up -d

# 4. Set up Nginx reverse proxy (optional but recommended)
sudo apt update
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/classcheck-wellness
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/classcheck-wellness /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 5. Set up SSL with Let's Encrypt (for HTTPS)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Update Deployment

When you make changes:

```bash
# On your VPS
cd /var/www/classcheck-wellness
sudo git pull
sudo docker-compose -f docker-compose.prod.yml down
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📁 Project Structure

```
classcheck-wellness/
├── backend/                    # Node.js + Express backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── seed.js            # Sample data
│   ├── src/
│   │   ├── routes/            # API routes
│   │   │   ├── auth.js        # Authentication routes
│   │   │   ├── checkins.js    # Mood check-in routes
│   │   │   ├── sessions.js    # Study session routes
│   │   │   ├── wellness.js    # Wellness dashboard routes
│   │   │   └── resources.js   # Resource library routes
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.js        # JWT authentication
│   │   │   └── errorHandler.js
│   │   ├── controllers/       # Business logic
│   │   ├── services/          # Database services
│   │   └── utils/             # Helper functions
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   └── server.js              # Entry point
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── wellness/
│   │   │   │   ├── MoodCheckinModal.jsx
│   │   │   │   ├── BreakReminder.jsx
│   │   │   │   ├── WellnessDashboard.jsx
│   │   │   │   ├── StudySessionTimer.jsx
│   │   │   │   └── ResourceLibrary.jsx
│   │   │   ├── common/        # Reusable components
│   │   │   └── layouts/       # Page layouts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API calls
│   │   ├── store/             # Zustand store
│   │   ├── pages/             # Page components
│   │   ├── assets/            # Images, fonts
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docs/                       # Documentation
│   ├── API.md                 # API documentation
│   ├── CONTRIBUTING.md        # How to contribute
│   └── DEPLOYMENT.md          # Deployment guide
│
├── docker-compose.yml         # Development Docker config
├── docker-compose.prod.yml    # Production Docker config
├── .gitignore
├── LICENSE
└── README.md                  # This file
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Port already in use" Error

```bash
# Find what's using the port
# Mac/Linux:
lsof -i :3000
lsof -i :5173

# Windows:
netstat -ano | findstr :3000

# Kill the process or change port in .env files
```

#### 2. Database Connection Failed

```bash
# Make sure PostgreSQL is running
# Docker:
docker ps

# Local:
# Mac:
brew services list
# Linux:
sudo systemctl status postgresql

# Check DATABASE_URL in backend/.env matches your setup
```

#### 3. "Command not found: npm"

```bash
# Reinstall Node.js from https://nodejs.org/
# Make sure to restart your terminal after installation
```

#### 4. Prisma Migration Errors

```bash
# Reset database (WARNING: deletes all data)
cd backend
npx prisma migrate reset

# Or manually delete and recreate
npx prisma db push --force-reset
```

#### 5. CORS Errors in Browser

Check that:
- Backend `.env` has correct `FRONTEND_URL`
- Frontend `.env` has correct `VITE_API_URL`
- Both servers are running

#### 6. "Cannot find module" Errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

If you're stuck:

1. **Check the logs**:
   ```bash
   # Backend logs
   cd backend
   npm run dev

   # Frontend logs
   cd frontend
   npm run dev

   # Docker logs
   docker-compose logs -f
   ```

2. **Search existing issues**: https://github.com/themalikmusab/classcheck-wellness/issues

3. **Create a new issue**: Include:
   - What you were trying to do
   - What happened instead
   - Error messages (copy the full text)
   - Your OS (Windows, Mac, Linux)
   - Node.js version (`node --version`)

---

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Manual Testing

1. **Check API Health**:
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

2. **Test Database Connection**:
   ```bash
   cd backend
   npx prisma studio
   # Opens database GUI at http://localhost:5555
   ```

---

## 📖 Usage Guide

### For Students

#### 1. Create Account
- Go to http://localhost:5173/signup
- Enter name, email, password
- Select "Student" role

#### 2. Daily Check-in
- Click "Check-in" button
- Select your mood (1-5)
- Choose stress level
- (Optional) Write a note
- Click Submit

#### 3. Start Study Session
- Click "Start Focus Session"
- Choose subject (optional)
- Timer starts counting
- You'll get break reminders every 25 minutes

#### 4. View Dashboard
- Go to "Wellness" tab
- See mood trends over time
- View insights and recommendations
- Check study-break balance

### For Educators

#### 1. Create Educator Account
- Sign up with role "Educator"
- Get verified (manual process for now)

#### 2. View Class Wellness
- Go to "Class Overview"
- See aggregate wellness scores
- View high-stress periods
- Check at-risk alerts

#### 3. Respond to Alerts
- Click on alert card
- View student trends (if they opted in)
- Mark as acknowledged
- Log intervention

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**:
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for [Classcheck.in](https://classcheck.in)
- Mental health resources from NIMHANS, KIRAN
- Inspired by EdTech wellness initiatives

---

## 📞 Support

### For Users
- Email: support@classcheck.in
- Documentation: https://docs.classcheck.in/wellness

### For Developers
- GitHub Issues: https://github.com/themalikmusab/classcheck-wellness/issues
- Discord Community: [Join here](#)

---

## 🎓 Learning Resources

If you're new to these technologies:

- **React**: https://react.dev/learn
- **Node.js**: https://nodejs.org/en/docs/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Prisma**: https://www.prisma.io/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Docker**: https://docs.docker.com/get-started/

---

## 🗺️ Roadmap

- [x] MVP: Mood check-ins, breaks, dashboard
- [ ] AI burnout detection
- [ ] Meditation audio library
- [ ] Parent portal
- [ ] Mobile app (React Native)
- [ ] Wearable integration (Fitbit)
- [ ] Multi-language support

---

## 💖 Made with Love

Built with ❤️ for students struggling with stress and burnout.

**Remember**: Your mental health matters. It's okay to take breaks. It's okay to ask for help.

---

**Happy Coding! 🚀**

If you find this project helpful, please ⭐ star it on GitHub!
