// Database Seed Script
// Populates database with sample data for development

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const studentPassword = await bcrypt.hash('student123', 10);
  const educatorPassword = await bcrypt.hash('educator123', 10);

  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      email: 'student@test.com',
      password: studentPassword,
      name: 'Test Student',
      role: 'STUDENT',
      isVerified: true
    }
  });

  const educator = await prisma.user.upsert({
    where: { email: 'educator@test.com' },
    update: {},
    create: {
      email: 'educator@test.com',
      password: educatorPassword,
      name: 'Test Educator',
      role: 'EDUCATOR',
      isVerified: true
    }
  });

  console.log('✅ Created test users');

  // Create wellness settings for student
  await prisma.wellnessSettings.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id
    }
  });

  // Create sample check-ins for last 7 days
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(20, 0, 0, 0);

    await prisma.wellnessCheckin.create({
      data: {
        userId: student.id,
        moodScore: Math.floor(Math.random() * 3) + 3, // 3-5
        stressLevel: i < 2 ? 'LOW' : i < 4 ? 'MEDIUM' : 'HIGH',
        energyLevel: Math.floor(Math.random() * 2) + 3,
        checkinType: 'DAILY',
        createdAt: date
      }
    });
  }

  console.log('✅ Created sample check-ins');

  // Create wellness resources
  const resources = [
    {
      type: 'MEDITATION',
      title: '5-Minute Exam Calm',
      description: 'Quick guided meditation for pre-exam anxiety',
      contentUrl: '/media/meditations/exam-calm.mp3',
      durationMinutes: 5,
      thumbnailUrl: '/media/thumbnails/exam-calm.jpg',
      tags: JSON.stringify(['anxiety', 'exam-stress']),
      isPremium: false
    },
    {
      type: 'BREATHING',
      title: 'Box Breathing Technique',
      description: '4-4-4-4 breathing for instant calm',
      contentUrl: '/media/breathing/box-breathing.mp3',
      durationMinutes: 3,
      tags: JSON.stringify(['stress', 'anxiety', 'quick']),
      isPremium: false
    },
    {
      type: 'ARTICLE',
      title: 'Managing Test Anxiety',
      description: 'Evidence-based strategies for reducing exam stress',
      contentUrl: '/articles/test-anxiety',
      tags: JSON.stringify(['exam-stress', 'tips']),
      isPremium: false
    }
  ];

  for (const resource of resources) {
    await prisma.wellnessResource.create({
      data: resource
    });
  }

  console.log('✅ Created wellness resources');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('Test Accounts:');
  console.log('  Student:  student@test.com  / student123');
  console.log('  Educator: educator@test.com / educator123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
