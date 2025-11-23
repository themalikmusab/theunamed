// Study Sessions Routes
const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('STUDENT'));

// TODO: Implement study session routes
// POST / - Start session
// POST /:id/end - End session  
// POST /:id/break - Take break
// GET / - Get sessions

router.get('/', (req, res) => {
  res.json({ message: 'Study sessions endpoint - Coming soon' });
});

module.exports = router;
