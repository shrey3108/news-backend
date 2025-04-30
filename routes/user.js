const express = require('express');
const router = express.Router();

// Placeholder for user subscriptions
router.post('/subscribe', (req, res) => {
  // Example: save category subscription logic
  res.json({ message: 'Subscribed to category' });
});

module.exports = router;
