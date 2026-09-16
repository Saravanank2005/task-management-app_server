const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Protect all task endpoints
router.use(protect);

// @route   GET /api/tasks & POST /api/tasks
router.route('/')
  .get(getTasks)
  .post(createTask);

// @route   PATCH /api/tasks/:id/status
// @desc    Update task state: Planned, In Progress, Complete
router.patch('/:id/status', updateTaskStatus);

// @route   PUT /api/tasks/:id & DELETE /api/tasks/:id
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
