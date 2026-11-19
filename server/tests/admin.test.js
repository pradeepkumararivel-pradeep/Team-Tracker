jest.mock('../models/User', () => ({
  findById: jest.fn()
}));
jest.mock('../models/ActivityLog', () => ({ create: jest.fn() }));
jest.mock('../models/Project', () => ({}));
jest.mock('../models/Task', () => ({}));

const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { toggleUserStatus } = require('../controllers/adminController');

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Admin user status management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prevents an admin from deactivating their own account', async () => {
    const admin = { _id: 'admin-id', isActive: true, save: jest.fn() };
    User.findById.mockResolvedValue(admin);
    const req = { params: { id: 'admin-id' }, user: { _id: 'admin-id' } };
    const res = createResponse();

    await toggleUserStatus(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'You cannot deactivate your own account'
    });
    expect(admin.isActive).toBe(true);
    expect(admin.save).not.toHaveBeenCalled();
    expect(ActivityLog.create).not.toHaveBeenCalled();
  });
});
