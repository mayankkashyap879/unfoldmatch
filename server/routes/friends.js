const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Match = require('../models/Match');

// Get user's friends
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('friends', 'username');
    res.json({ friends: user.friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending friendship requests
router.get('/pending', auth, async (req, res) => {
  try {
    const pendingMatches = await Match.find({
      users: req.user.userId,
      status: 'pending_friendship',
      friendshipInitiator: { $ne: req.user.userId }
    }).populate('users', 'username');

    const pendingFriendships = pendingMatches.map(match => ({
      _id: match._id,
      username: match.users.find(user => user._id.toString() !== req.user.userId).username,
      matchId: match._id
    }));

    res.json({ pendingFriendships });
  } catch (error) {
    console.error('Error fetching pending friendships:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;