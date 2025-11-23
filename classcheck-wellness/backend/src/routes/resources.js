// Wellness Resources Routes
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// GET / - Get resources library
// GET /crisis - Get crisis support resources
// POST /:id/interact - Log resource interaction

router.get('/', (req, res) => {
  res.json({ message: 'Resources endpoint - Coming soon', resources: [] });
});

router.get('/crisis', (req, res) => {
  res.json({
    hotlines: [
      {
        name: 'KIRAN Mental Health Helpline',
        phone: '1800-599-0019',
        available: '24/7',
        language: ['Hindi', 'English', 'Regional'],
        country: 'IN'
      }
    ]
  });
});

module.exports = router;
