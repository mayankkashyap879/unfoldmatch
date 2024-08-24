const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Match = require('../models/Match');

const MATCH_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CHAT_MILESTONE = 10; // Number of messages to become friends
const MAX_ACTIVE_MATCHES = 5; // Maximum number of active matches per user

router.get('/', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Current user:', currentUser.username);

    // Get user's active matches and pending friendship requests
    const activeMatches = await Match.find({
      users: currentUser._id,
      $or: [
        { status: 'active', expiresAt: { $gt: new Date() } },
        { status: 'pending_friendship' }
      ]
    }).populate('users', 'username');

    console.log('Active matches:', activeMatches.length);

    // If user has reached the maximum number of active matches, don't create a new one
    if (activeMatches.length >= MAX_ACTIVE_MATCHES) {
      return res.json({ matches: activeMatches });
    }

    // Find potential matches with relaxed criteria for testing
    const potentialMatches = await User.find({
      _id: { $ne: currentUser._id },
      // Temporarily comment out strict matching criteria for testing
      // Add your matching criteria here
    }).sort({ createdAt: -1 });

    console.log('Potential matches found:', potentialMatches.length);

    const newMatches = [];

    for (const potentialMatch of potentialMatches) {
      if (activeMatches.length + newMatches.length >= MAX_ACTIVE_MATCHES) break;

      // Check if a match already exists
      const existingMatch = await Match.findOne({
        users: { $all: [currentUser._id, potentialMatch._id] },
        status: { $in: ['active', 'pending_friendship', 'friends'] }
      });
      
      if (!existingMatch) {
        const newMatch = new Match({
          users: [currentUser._id, potentialMatch._id],
          expiresAt: new Date(Date.now() + MATCH_DURATION)
        });
        await newMatch.save();
        newMatches.push(newMatch);
        console.log('New match created:', newMatch._id);
      } else {
        console.log('Match already exists:', existingMatch._id);
      }
    }

    const allMatches = [...activeMatches, ...newMatches];
    
    console.log('Total matches returned:', allMatches.length);

    res.json({ 
      matches: allMatches.map(match => ({
        _id: match._id,
        username: match.users.find(user => !user._id.equals(currentUser._id)).username,
        expiresAt: match.expiresAt,
        status: match.status
      }))
    });

  } catch (error) {
    console.error('Error fetching/creating matches:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/request-friendship/:matchId', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    console.log(`Match ${match._id} message count: ${match.messageCount}`);

    if (match.messageCount < CHAT_MILESTONE) {
      return res.status(400).json({ message: 'Chat milestone not reached' });
    }

    if (match.status !== 'active') {
      return res.status(400).json({ message: 'Invalid match status for friendship request' });
    }

    match.status = 'pending_friendship';
    match.friendshipInitiator = req.user.userId;
    await match.save();

    res.json({ message: 'Friendship requested', match });
  } catch (error) {
    console.error('Error requesting friendship:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/respond-friendship/:matchId', auth, async (req, res) => {
  try {
    const { accept } = req.body;
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.status !== 'pending_friendship') {
      return res.status(400).json({ message: 'Invalid match status for friendship response' });
    }

    if (match.friendshipInitiator.equals(req.user.userId)) {
      return res.status(400).json({ message: 'Cannot respond to your own friendship request' });
    }

    if (accept) {
      match.status = 'friends';
      // Add users to each other's friend list
      await User.updateMany(
        { _id: { $in: match.users } },
        { $addToSet: { friends: { $each: match.users } } }
      );
    } else {
      match.status = 'active';
    }
    await match.save();

    res.json({ message: accept ? 'Friendship accepted' : 'Friendship rejected', match });
  } catch (error) {
    console.error('Error responding to friendship:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/friendship-status/:matchId', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    let status = 'none';
    if (match.status === 'friends') {
      status = 'friends';
    } else if (match.status === 'pending_friendship') {
      status = match.friendshipInitiator.equals(req.user.userId) ? 'pending_sent' : 'pending_received';
    }

    res.json({ status });
  } catch (error) {
    console.error('Error checking friendship status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:matchId/status', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.json({ status: match.status });
  } catch (error) {
    console.error('Error fetching match status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;