const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

const getProjects = async (req, res, next) => {
  try {
    const query = req.user.role === 'Admin'
      ? {}
      : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

    const projects = await Project.find(query)
      .populate('owner', 'name email role')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isAuthorized = req.user.role === 'Admin' ||
      project.owner._id.equals(req.user._id) ||
      project.members.some((m) => m._id.equals(req.user._id));

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { title, description, deadline, priority, members = [] } = req.body;
    const memberSet = new Set([req.user._id.toString(), ...members]);

    const project = await Project.create({
      title,
      description,
      deadline,
      priority: priority || 'Medium',
      owner: req.user._id,
      members: Array.from(memberSet)
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'CREATE_PROJECT',
      details: `Created project: ${title}`
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (req.user.role !== 'Admin' && !project.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only project owner or Admin can update project' });
    }

    Object.assign(project, req.body);
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (req.user.role !== 'Admin' && !project.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only project owner or Admin can delete project' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (req.user.role !== 'Admin' && !project.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage members' });
    }

    const { userId } = req.body;
    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();

      await Notification.create({
        recipient: userId,
        sender: req.user._id,
        type: 'project_invite',
        title: 'Added to Project',
        message: `You were added to project "${project.title}"`,
        link: '/projects'
      });
    }

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember
};
