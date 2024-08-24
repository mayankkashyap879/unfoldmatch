// server/routes/diagnostic.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Match = require('../models/Match');

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username gender age preferences');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

router.get('/matches', async (req, res) => {
  try {
    const matches = await Match.find({}).populate('users', 'username');
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching matches', error: error.message });
  }
});

module.exports = router;