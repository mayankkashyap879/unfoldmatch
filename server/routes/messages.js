// server/routes/messages.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

router.get('/:matchId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ matchId: req.params.matchId })
      .sort({ timestamp: 1 });
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;