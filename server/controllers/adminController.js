const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Team Leader', 'Team Member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    await ActivityLog.create({
      user: req.user._id,
      action: 'UPDATE_ROLE',
      details: `Updated ${user.email} role to ${role}`
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (String(user._id) === String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You cannot deactivate your own account' });
    }
    user.isActive = !user.isActive;
    await user.save();
    await ActivityLog.create({
      user: req.user._id,
      action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      details: `${user.isActive ? 'Activated' : 'Deactivated'} user ${user.email}`
    });
    res.json({ success: true, data: { _id: user._id, isActive: user.isActive } });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

const getPlatformStats = async (req, res, next) => {
  try {
    const [usersCount, projectsCount, tasksCount, completedTasks] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: 'Completed' })
    ]);
    res.json({
      success: true,
      data: { usersCount, projectsCount, tasksCount, completedTasks }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateUserRole, toggleUserStatus, getAuditLogs, getPlatformStats };
