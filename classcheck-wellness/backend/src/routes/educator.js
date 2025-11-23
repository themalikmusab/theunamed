// Educator Routes  
const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('EDUCATOR'));

// GET /students - Get class wellness overview
// GET /alerts - Get wellness alerts
// POST /alerts/:id/acknowledge - Acknowledge alert

router.get('/students', (req, res) => {
  res.json({ message: 'Educator dashboard endpoint - Coming soon', students: [] });
});

module.exports = router;
