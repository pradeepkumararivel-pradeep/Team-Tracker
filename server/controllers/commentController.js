const Comment = require('../models/Comment');
const Task = require('../models/Task');

const getCommentsByTask = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email role')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const comment = await Comment.create({
      task: req.params.taskId,
      author: req.user._id,
      content: req.body.content
    });

    const populated = await Comment.findById(comment._id).populate('author', 'name email role');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCommentsByTask, addComment };
