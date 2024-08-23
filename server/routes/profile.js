// server/routes/profile.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const {
      bio,
      interests,
      purpose,
      age,
      gender,
      searchGlobally,
      country,
      personalityType,
      preferences
    } = req.body;

    const updateData = {
      bio,
      interests,
      age,
      searchGlobally,
      country,
      personalityType,
      preferences
    };

    // Only include purpose and gender if they are defined
    if (purpose !== undefined) updateData.purpose = purpose;
    if (gender !== undefined) updateData.gender = gender;

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;