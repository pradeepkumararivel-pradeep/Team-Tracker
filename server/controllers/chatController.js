const Message = require('../models/Message');
const Project = require('../models/Project');

const getProjectMessages = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const messages = await Message.find({ project: req.params.projectId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

const sendProjectMessage = async (req, res, next) => {
  try {
    const message = await Message.create({
      project: req.params.projectId,
      sender: req.user._id,
      content: req.body.content
    });

    const populated = await Message.findById(message._id).populate('sender', 'name email role');
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.projectId).emit('receive_message', populated);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjectMessages, sendProjectMessage };
