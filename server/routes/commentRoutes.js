const express = require('express');
const router = express.Router();
const { getCommentsByTask, addComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:taskId')
  .get(protect, getCommentsByTask)
  .post(protect, addComment);

module.exports = router;
