const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Match = require('../models/Match');

router.get('/', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has an active match
    const existingMatch = await Match.findOne({
      users: currentUser._id,
      status: 'active'
    }).populate('users', 'username');

    if (existingMatch) {
      const matchedUser = existingMatch.users.find(user => !user._id.equals(currentUser._id));
      return res.json({
        match: {
          _id: existingMatch._id,
          username: matchedUser.username,
          compatibilityScore: 100 // You might want to store and return the actual score
        }
      });
    }

    // If no existing match, find a new match
    const potentialMatch = await User.findOne({
      _id: { $ne: currentUser._id },
      gender: { $in: currentUser.preferences.genderPreference },
      age: { 
        $gte: currentUser.preferences.ageRange.min,
        $lte: currentUser.preferences.ageRange.max
      }
    }).sort({ createdAt: -1 });

    if (potentialMatch) {
      const newMatch = new Match({
        users: [currentUser._id, potentialMatch._id]
      });
      await newMatch.save();

      res.json({
        match: {
          _id: newMatch._id,
          username: potentialMatch.username,
          compatibilityScore: calculateCompatibilityScore(currentUser, potentialMatch)
        }
      });
    } else {
      res.json({ match: null });
    }
  } catch (error) {
    console.error('Error fetching/creating match:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

function calculateCompatibilityScore(user1, user2) {
  // let score = 0;
  // let maxScore = 0;

  // // Interests compatibility
  // const commonInterests = user1.interests.filter(interest => user2.interests.includes(interest));
  // const totalInterests = new Set([...user1.interests, ...user2.interests]).size;
  // score += (commonInterests.length / totalInterests) * 30;
  // maxScore += 30;

  // // Personality type compatibility
  // if (user1.personalityType === user2.personalityType) {
  //   score += 25;
  // } else if (user1.personalityType && user2.personalityType) {
  //   // Partial match for first letter (E/I) and last letter (J/P)
  //   if (user1.personalityType[0] === user2.personalityType[0]) score += 5;
  //   if (user1.personalityType[3] === user2.personalityType[3]) score += 5;
  // }
  // maxScore += 25;

  // // Purpose compatibility
  // if (user1.purpose === user2.purpose) {
  //   score += 25;
  // }
  // maxScore += 25;

  // // Age compatibility
  // const ageDifference = Math.abs(user1.age - user2.age);
  // const ageScore = Math.max(0, 20 - ageDifference);
  // score += ageScore;
  // maxScore += 20;

  // // Calculate final percentage
  // const compatibilityPercentage = Math.round((score / maxScore) * 100);

  return 100;
}

module.exports = router;