jest.mock('../models/Task', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));
jest.mock('../models/Project', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));
jest.mock('../models/Notification', () => ({ create: jest.fn() }));
jest.mock('../models/ActivityLog', () => ({ create: jest.fn() }));

const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { createTask, updateTask, deleteTask } = require('../controllers/taskController');

const createProject = () => ({
  _id: 'project-id',
  owner: { equals: (userId) => userId === 'owner-id' },
  members: [{ equals: (userId) => userId === 'member-id' }]
});

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Task assignment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Project.findById.mockResolvedValue(createProject());
  });

  it('prevents team members from assigning tasks', async () => {
    const req = {
      user: { _id: 'member-id', role: 'Team Member' },
      body: { project: 'project-id', title: 'Task', assignedTo: 'member-id' }
    };
    const res = createResponse();

    await createTask(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Task.create).not.toHaveBeenCalled();
  });

  it('rejects assignments to people outside the project', async () => {
    const req = {
      user: { _id: 'leader-id', role: 'Team Leader' },
      body: { project: 'project-id', title: 'Task', assignedTo: 'outsider-id' }
    };
    const res = createResponse();

    await createTask(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Task.create).not.toHaveBeenCalled();
  });

  it.each(['Admin', 'Team Leader'])('allows %s to assign tasks to project members', async (role) => {
    const populatedTask = { populate: jest.fn().mockReturnThis() };
    Task.create.mockResolvedValue({ _id: 'task-id' });
    Task.find.mockResolvedValue([]);
    Task.findById.mockReturnValue(populatedTask);
    Project.findByIdAndUpdate.mockResolvedValue({});
    Notification.create.mockResolvedValue({});
    ActivityLog.create.mockResolvedValue({});
    const req = {
      user: { _id: { toString: () => 'leader-id' }, role },
      body: { project: 'project-id', title: 'Task', assignedTo: 'member-id' },
      app: { get: () => null }
    };
    const res = createResponse();

    await createTask(req, res, jest.fn());

    expect(Task.create).toHaveBeenCalledWith(expect.objectContaining({ assignedTo: 'member-id' }));
    expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({ recipient: 'member-id' }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('prevents team members from changing an assignee', async () => {
    const task = { project: 'project-id', save: jest.fn() };
    Task.findById.mockResolvedValue(task);
    const req = {
      user: { role: 'Team Member' },
      params: { id: 'task-id' },
      body: { assignedTo: 'member-id' }
    };
    const res = createResponse();

    await updateTask(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(task.save).not.toHaveBeenCalled();
  });

  it('allows admins to remove an assignee', async () => {
    const task = { project: 'project-id', assignedTo: 'member-id', save: jest.fn() };
    const populatedTask = { populate: jest.fn().mockReturnThis() };
    Task.findById
      .mockResolvedValueOnce(task)
      .mockReturnValueOnce(populatedTask);
    Task.find.mockResolvedValue([]);
    Project.findByIdAndUpdate.mockResolvedValue({});
    const req = {
      user: { role: 'Admin' },
      params: { id: 'task-id' },
      body: { assignedTo: null },
      app: { get: () => null }
    };
    const res = createResponse();

    await updateTask(req, res, jest.fn());

    expect(task.assignedTo).toBeNull();
    expect(task.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('allows admins to delete tasks and recalculates project progress', async () => {
    const task = { project: 'project-id', deleteOne: jest.fn() };
    Task.findById.mockResolvedValue(task);
    Task.find.mockResolvedValue([]);
    Project.findByIdAndUpdate.mockResolvedValue({});
    const req = { user: { role: 'Admin' }, params: { id: 'task-id' } };
    const res = createResponse();

    await deleteTask(req, res, jest.fn());

    expect(task.deleteOne).toHaveBeenCalled();
    expect(Project.findByIdAndUpdate).toHaveBeenCalledWith('project-id', { progress: 0 });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
