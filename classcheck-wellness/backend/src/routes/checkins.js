// Wellness Check-ins Routes
// Handles mood tracking and check-ins

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);
router.use(requireRole('STUDENT'));

/**
 * POST /api/v1/wellness/checkins
 * Create a new wellness check-in
 */
router.post(
  '/',
  [
    body('moodScore').isInt({ min: 1, max: 5 }).withMessage('Mood score must be between 1 and 5'),
    body('stressLevel').isIn(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).withMessage('Invalid stress level'),
    body('energyLevel').optional().isInt({ min: 1, max: 5 }),
    body('journalEntry').optional().trim().isLength({ max: 1000 }),
    body('checkinType').optional().isIn(['DAILY', 'POST_QUIZ', 'POST_STUDY', 'MANUAL'])
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { moodScore, stressLevel, energyLevel, journalEntry, checkinType = 'DAILY' } = req.body;

    // Create check-in
    const checkin = await req.prisma.wellnessCheckin.create({
      data: {
        userId: req.user.id,
        moodScore,
        stressLevel,
        energyLevel,
        journalEntry,
        checkinType
      }
    });

    // Generate insight based on check-in
    const insight = await generateCheckinInsight(req.prisma, req.user.id, checkin);

    // Update streak
    await updateCheckinStreak(req.prisma, req.user.id);

    res.status(201).json({
      message: 'Check-in recorded successfully',
      checkin,
      insight
    });
  })
);

/**
 * GET /api/v1/wellness/checkins
 * Get user's check-in history
 */
router.get(
  '/',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { startDate, endDate, limit = 30, offset = 0 } = req.query;

    const where = {
      userId: req.user.id,
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) })
        }
      } : {})
    };

    const [checkins, total] = await Promise.all([
      req.prisma.wellnessCheckin.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
        select: {
          id: true,
          moodScore: true,
          stressLevel: true,
          energyLevel: true,
          checkinType: true,
          createdAt: true,
          // Don't include journal entry in list view for privacy
        }
      }),
      req.prisma.wellnessCheckin.count({ where })
    ]);

    res.json({
      checkins,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  })
);

/**
 * GET /api/v1/wellness/checkins/:id
 * Get specific check-in with full details
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const checkin = await req.prisma.wellnessCheckin.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id // Ensure user can only access their own check-ins
      }
    });

    if (!checkin) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Check-in not found'
      });
    }

    res.json({ checkin });
  })
);

/**
 * GET /api/v1/wellness/checkins/stats
 * Get aggregated check-in statistics
 */
router.get(
  '/stats/summary',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'year'])
  ],
  asyncHandler(async (req, res) => {
    const period = req.query.period || 'week';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get check-ins in period
    const checkins = await req.prisma.wellnessCheckin.findMany({
      where: {
        userId: req.user.id,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (checkins.length === 0) {
      return res.json({
        period,
        message: 'No check-ins found for this period',
        avgMoodScore: null,
        avgStressLevel: null,
        totalCheckins: 0,
        checkinStreak: 0
      });
    }

    // Calculate statistics
    const avgMoodScore = (
      checkins.reduce((sum, c) => sum + c.moodScore, 0) / checkins.length
    ).toFixed(2);

    const stressLevels = checkins.map(c => c.stressLevel);
    const stressMap = { LOW: 1, MEDIUM: 2, HIGH: 3, VERY_HIGH: 4 };
    const avgStressValue = stressLevels.reduce((sum, s) => sum + stressMap[s], 0) / stressLevels.length;
    const avgStressLevel = Object.keys(stressMap).find(
      key => stressMap[key] === Math.round(avgStressValue)
    );

    // Calculate trend
    const midPoint = Math.floor(checkins.length / 2);
    const firstHalfAvg = checkins.slice(0, midPoint).reduce((sum, c) => sum + c.moodScore, 0) / midPoint;
    const secondHalfAvg = checkins.slice(midPoint).reduce((sum, c) => sum + c.moodScore, 0) / (checkins.length - midPoint);

    let trend = 'stable';
    if (secondHalfAvg > firstHalfAvg + 0.3) trend = 'improving';
    if (secondHalfAvg < firstHalfAvg - 0.3) trend = 'declining';

    // Count high stress days
    const highStressDays = checkins.filter(c =>
      c.stressLevel === 'HIGH' || c.stressLevel === 'VERY_HIGH'
    ).length;

    // Calculate mood distribution
    const moodDistribution = {
      1: checkins.filter(c => c.moodScore === 1).length,
      2: checkins.filter(c => c.moodScore === 2).length,
      3: checkins.filter(c => c.moodScore === 3).length,
      4: checkins.filter(c => c.moodScore === 4).length,
      5: checkins.filter(c => c.moodScore === 5).length
    };

    // Calculate streak
    const streak = await calculateCheckinStreak(req.prisma, req.user.id);

    res.json({
      period,
      avgMoodScore: parseFloat(avgMoodScore),
      avgStressLevel,
      trend,
      highStressDays,
      totalCheckins: checkins.length,
      checkinStreak: streak,
      moodDistribution
    });
  })
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate insight based on check-in data
 */
async function generateCheckinInsight(prisma, userId, checkin) {
  // Get recent check-ins for comparison
  const recentCheckins = await prisma.wellnessCheckin.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 7
  });

  if (recentCheckins.length < 2) {
    return {
      message: 'Thanks for checking in! Keep tracking your wellness.',
      suggestion: null
    };
  }

  const avgMood = recentCheckins.reduce((sum, c) => sum + c.moodScore, 0) / recentCheckins.length;

  // High stress detected
  if (checkin.stressLevel === 'HIGH' || checkin.stressLevel === 'VERY_HIGH') {
    return {
      message: 'Your stress is higher than usual. Consider taking a break.',
      suggestion: 'Try a 5-minute breathing exercise or a short walk.'
    };
  }

  // Mood improving
  if (checkin.moodScore > avgMood + 0.5) {
    return {
      message: 'Your mood is improving! Keep up the good work. 🌟',
      suggestion: null
    };
  }

  // Mood declining
  if (checkin.moodScore < avgMood - 0.5) {
    return {
      message: 'Your mood seems lower than usual. Remember to take care of yourself.',
      suggestion: 'Consider talking to someone or checking out our wellness resources.'
    };
  }

  return {
    message: 'Thanks for checking in!',
    suggestion: null
  };
}

/**
 * Update check-in streak
 */
async function updateCheckinStreak(prisma, userId) {
  // This is a placeholder - in production, you'd store streak in user settings
  // For now, it's calculated on-demand in calculateCheckinStreak
  return true;
}

/**
 * Calculate consecutive check-in streak
 */
async function calculateCheckinStreak(prisma, userId) {
  const checkins = await prisma.wellnessCheckin.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 365, // Check up to 1 year
    select: { createdAt: true }
  });

  if (checkins.length === 0) return 0;

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if most recent check-in is today or yesterday
  const lastCheckin = new Date(checkins[0].createdAt);
  lastCheckin.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today - lastCheckin) / (1000 * 60 * 60 * 24));

  if (daysDiff > 1) return 0; // Streak broken

  // Count consecutive days
  for (let i = 1; i < checkins.length; i++) {
    const currentDate = new Date(checkins[i].createdAt);
    currentDate.setHours(0, 0, 0, 0);

    const prevDate = new Date(checkins[i - 1].createdAt);
    prevDate.setHours(0, 0, 0, 0);

    const diff = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break; // Streak broken
    }
    // If diff === 0, same day, continue
  }

  return streak;
}

module.exports = router;
