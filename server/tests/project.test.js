jest.mock('../models/Project', () => ({
  findById: jest.fn()
}));
jest.mock('../models/Task', () => ({
  deleteMany: jest.fn()
}));
jest.mock('../models/User', () => ({
  find: jest.fn(),
  findById: jest.fn()
}));
jest.mock('../models/ActivityLog', () => ({ create: jest.fn() }));
jest.mock('../models/Notification', () => ({ create: jest.fn() }));

const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { addMember, getAvailableMembers, deleteProject } = require('../controllers/projectController');

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Project member management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists active users who are not already project members', async () => {
    const project = { owner: 'owner-id', members: ['member-id'] };
    const users = [{ _id: 'new-member-id', name: 'New Member' }];
    const userQuery = { select: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue(users) };
    Project.findById.mockResolvedValue(project);
    User.find.mockReturnValue(userQuery);
    const req = { params: { id: 'project-id' }, user: { role: 'Admin' } };
    const res = createResponse();

    await getAvailableMembers(req, res, jest.fn());

    expect(User.find).toHaveBeenCalledWith({
      isActive: true,
      _id: { $nin: ['member-id', 'owner-id'] }
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, count: 1, data: users });
  });

  it('adds an active user to the project and notifies them', async () => {
    const memberId = '507f1f77bcf86cd799439011';
    const project = {
      _id: 'project-id',
      title: 'Project',
      owner: { equals: (userId) => userId === 'leader-id' },
      members: [],
      save: jest.fn()
    };
    const populatedProject = { populate: jest.fn().mockReturnThis() };
    Project.findById
      .mockResolvedValueOnce(project)
      .mockReturnValueOnce(populatedProject);
    User.findById.mockResolvedValue({ _id: memberId, isActive: true });
    Notification.create.mockResolvedValue({});
    const req = {
      params: { id: 'project-id' },
      user: { _id: 'leader-id', role: 'Team Leader' },
      body: { userId: memberId }
    };
    const res = createResponse();

    await addMember(req, res, jest.fn());

    expect(project.members).toContain(memberId);
    expect(project.save).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({ recipient: memberId }));
  });

  it('allows admins to delete projects and their tasks', async () => {
    const project = { _id: 'project-id', deleteOne: jest.fn() };
    Project.findById.mockResolvedValue(project);
    Task.deleteMany.mockResolvedValue({});
    const req = {
      params: { id: 'project-id' },
      user: { role: 'Admin', _id: 'admin-id' }
    };
    const res = createResponse();

    await deleteProject(req, res, jest.fn());

    expect(Task.deleteMany).toHaveBeenCalledWith({ project: 'project-id' });
    expect(project.deleteOne).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
