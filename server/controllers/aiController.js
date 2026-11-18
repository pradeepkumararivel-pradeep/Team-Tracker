const Project = require('../models/Project');
const Task = require('../models/Task');

const queryAI = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const projectFilter = req.user.role === 'Admin'
      ? {}
      : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

    const projects = await Project.find(projectFilter);
    const projectIds = projects.map((p) => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } }).populate('assignedTo', 'name');

    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.deadline && new Date(t.deadline) < now && t.status !== 'Completed'
    );
    const completedTasks = tasks.filter((t) => t.status === 'Completed');
    const highPriority = tasks.filter(
      (t) => (t.priority === 'High' || t.priority === 'Critical') && t.status !== 'Completed'
    );

    const apiKeyConfigured = Boolean(
      process.env.AI_API_KEY && !process.env.AI_API_KEY.includes('your-api-key')
    );

    const lower = prompt.toLowerCase();
    let answer = '';

    if (lower.includes('overdue')) {
      answer = overdueTasks.length > 0
        ? `You currently have ${overdueTasks.length} overdue task(s): ${overdueTasks.map((t) => `"${t.title}"`).join(', ')}. Consider reassigning or breaking these down immediately.`
        : 'Great news! You have zero overdue tasks across your authorized projects.';
    } else if (lower.includes('summary') || lower.includes('progress')) {
      const rate = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
      answer = `Project Summary: You have access to ${projects.length} project(s) and ${tasks.length} total task(s). Completion rate is ${rate}% (${completedTasks.length}/${tasks.length} completed), with ${highPriority.length} high/critical priority tasks remaining.`;
    } else if (lower.includes('priority') || lower.includes('focus')) {
      answer = highPriority.length > 0
        ? `Recommended focus items (${highPriority.length} high/critical tasks): ${highPriority.slice(0, 5).map((t) => `"${t.title}" [${t.priority}]`).join(', ')}.`
        : 'No open High or Critical priority tasks detected. Focus on advancing In Progress items.';
    } else {
      answer = `Based on your ${projects.length} active project(s) and ${tasks.length} task(s) (${completedTasks.length} completed, ${overdueTasks.length} overdue), I recommend reviewing upcoming deadlines and balancing workload across active team members.`;
    }

    res.json({
      success: true,
      aiConfigured: apiKeyConfigured,
      response: answer,
      stats: {
        projectsCount: projects.length,
        tasksCount: tasks.length,
        completedCount: completedTasks.length,
        overdueCount: overdueTasks.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { queryAI };
