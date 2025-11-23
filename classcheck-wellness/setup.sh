#!/bin/bash

# Classcheck Wellness - Quick Setup Script
# This script helps you set up the project quickly

echo "🌱 ========================================="
echo "🌱 Classcheck Wellness - Quick Setup"
echo "🌱 ========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Download from: https://www.docker.com/get-started"
    exit 1
fi

echo "✅ Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker Compose is installed"
echo ""

# Copy environment files
echo "📝 Creating environment files..."

if [ ! -f "./backend/.env" ]; then
    cp ./backend/.env.example ./backend/.env
    echo "✅ Created backend/.env"
else
    echo "⏭️  backend/.env already exists, skipping"
fi

if [ ! -f "./frontend/.env" ]; then
    cp ./frontend/.env.example ./frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "⏭️  frontend/.env already exists, skipping"
fi

echo ""
echo "🚀 Starting Docker containers..."
echo ""

# Start Docker containers
docker-compose up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 10

echo ""
echo "📦 Running database migrations..."

# Run Prisma migrations
docker-compose exec backend npx prisma migrate dev --name init

echo ""
echo "🌱 Seeding database with sample data..."

# Seed database
docker-compose exec backend npm run seed

echo ""
echo "🎉 ========================================="
echo "🎉 Setup Complete!"
echo "🎉 ========================================="
echo ""
echo "✅ Frontend: http://localhost:5173"
echo "✅ Backend API: http://localhost:3000"
echo "✅ Database: localhost:5432"
echo ""
echo "Test Accounts:"
echo "  📚 Student:  student@test.com  / student123"
echo "  👨‍🏫 Educator: educator@test.com / educator123"
echo ""
echo "Commands:"
echo "  🛑 Stop:    docker-compose down"
echo "  📊 Logs:    docker-compose logs -f"
echo "  🔄 Restart: docker-compose restart"
echo ""
echo "Happy coding! 🚀"
