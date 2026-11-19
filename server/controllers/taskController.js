const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const canAssignTasks = (user) => ['Admin', 'Team Leader'].includes(user.role);

const isProjectMember = (project, userId) =>
  project.owner.equals(userId) || project.members.some((member) => member.equals(userId));

const recalculateProjectProgress = async (projectId) => {
  const tasks = await Task.find({ project: projectId });
  if (tasks.length === 0) {
    await Project.findByIdAndUpdate(projectId, { progress: 0 });
    return;
  }
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const progress = Math.round((completed / tasks.length) * 100);
  await Project.findByIdAndUpdate(projectId, { progress });
};

const getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, search } = req.query;

    const projectFilter = req.user.role === 'Admin'
      ? {}
      : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

    const accessibleProjects = await Project.find(projectFilter).select('_id');
    const accessibleIds = accessibleProjects.map((p) => p._id);

    const query = { project: { $in: accessibleIds } };
    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query)
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, status, priority, category, labels, deadline } = req.body;

    const targetProject = await Project.findById(project);
    if (!targetProject) return res.status(404).json({ success: false, message: 'Project not found' });

    if (assignedTo) {
      if (!canAssignTasks(req.user)) {
        return res.status(403).json({ success: false, message: 'Only Admins and Team Leaders can assign tasks' });
      }
      if (!isProjectMember(targetProject, assignedTo)) {
        return res.status(400).json({ success: false, message: 'Assignee must be a member of the project' });
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || undefined,
      createdBy: req.user._id,
      status: status || 'To Do',
      priority: priority || 'Medium',
      category: category || 'General',
      labels: labels || [],
      deadline
    });

    await recalculateProjectProgress(project);

    if (assignedTo && assignedTo !== req.user._id.toString()) {
      await Notification.create({
        recipient: assignedTo,
        sender: req.user._id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to "${title}"`,
        link: '/tasks'
      });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'CREATE_TASK',
      details: `Created task "${title}"`
    });

    const populated = await Task.findById(task._id)
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    const io = req.app.get('io');
    if (io) {
      io.to(project.toString()).emit('task_updated', populated);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (Object.prototype.hasOwnProperty.call(req.body, 'assignedTo')) {
      if (!canAssignTasks(req.user)) {
        return res.status(403).json({ success: false, message: 'Only Admins and Team Leaders can assign tasks' });
      }
      if (req.body.assignedTo) {
        const project = await Project.findById(task.project);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
        if (!isProjectMember(project, req.body.assignedTo)) {
          return res.status(400).json({ success: false, message: 'Assignee must be a member of the project' });
        }
      }
    }

    Object.assign(task, req.body);
    await task.save();

    await recalculateProjectProgress(task.project);

    const populated = await Task.findById(task._id)
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    const io = req.app.get('io');
    if (io) {
      io.to(task.project.toString()).emit('task_updated', populated);
    }

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const projectId = task.project;
    await task.deleteOne();
    await recalculateProjectProgress(projectId);

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
