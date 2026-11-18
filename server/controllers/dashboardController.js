const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const getDashboardStats = async (req, res, next) => {
  try {
    const projectFilter = req.user.role === 'Admin'
      ? {}
      : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

    const projects = await Project.find(projectFilter);
    const projectIds = projects.map((p) => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'title')
      .populate('assignedTo', 'name');

    const now = new Date();
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
    const overdueTasks = tasks.filter(
      (t) => t.deadline && new Date(t.deadline) < now && t.status !== 'Completed'
    ).length;

    const productivityRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const upcomingDeadlines = tasks
      .filter((t) => t.deadline && t.status !== 'Completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);

    const recentActivity = await ActivityLog.find()
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .limit(8);

    const tasksByStatus = [
      { name: 'To Do', value: tasks.filter((t) => t.status === 'To Do').length },
      { name: 'In Progress', value: tasks.filter((t) => t.status === 'In Progress').length },
      { name: 'Review', value: tasks.filter((t) => t.status === 'Review').length },
      { name: 'Completed', value: completedTasks }
    ];

    res.json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        productivityRate,
        upcomingDeadlines,
        recentActivity,
        tasksByStatus,
        projects
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
