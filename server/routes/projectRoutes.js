const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('Admin', 'Team Leader'), createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('Admin', 'Team Leader'), updateProject)
  .delete(protect, authorize('Admin', 'Team Leader'), deleteProject);

router.post('/:id/members', protect, authorize('Admin', 'Team Leader'), addMember);

module.exports = router;
