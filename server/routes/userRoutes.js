const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true }).select('name email role profilePicture');
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
