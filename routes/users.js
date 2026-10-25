const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'bio', 'location', 'photo'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields supplied' });
    }

    if (updates.name !== undefined && (!String(updates.name).trim())) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }

    if (updates.phone !== undefined && typeof updates.phone !== 'string') {
      return res.status(400).json({ message: 'Phone must be a string' });
    }

    if (updates.bio !== undefined && typeof updates.bio !== 'string') {
      return res.status(400).json({ message: 'Bio must be a string' });
    }

    if (updates.location !== undefined && typeof updates.location !== 'string') {
      return res.status(400).json({ message: 'Location must be a string' });
    }

    if (updates.photo !== undefined && typeof updates.photo !== 'string') {
      return res.status(400).json({ message: 'Photo must be a string URL' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
