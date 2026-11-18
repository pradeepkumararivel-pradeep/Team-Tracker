const express = require('express');
const router = express.Router();
const { getProjectMessages, sendProjectMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:projectId')
  .get(protect, getProjectMessages)
  .post(protect, sendProjectMessage);

module.exports = router;
