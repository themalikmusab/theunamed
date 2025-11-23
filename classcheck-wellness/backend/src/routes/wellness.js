// Wellness Dashboard Routes
const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('STUDENT'));

// GET /dashboard - Get wellness dashboard
// GET /insights - Get personalized insights
// PATCH /insights/:id/read - Mark insight as read
// GET /settings - Get wellness settings
// PATCH /settings - Update settings

router.get('/dashboard', (req, res) => {
  res.json({ message: 'Wellness dashboard endpoint - Coming soon' });
});

router.get('/settings', (req, res) => {
  res.json({ message: 'Wellness settings endpoint - Coming soon' });
});

module.exports = router;
