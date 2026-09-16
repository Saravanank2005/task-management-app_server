const storeService = require('../services/storeService');

// Get all tasks for the logged-in user
const getTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, search } = req.query;

    const tasks = await storeService.getTasksByUser(userId, { status, search });
    return res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    console.error('[Get Tasks Error]', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving tasks' });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    if (status && !['Planned', 'In Progress', 'Complete'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Planned, In Progress, or Complete' });
    }

    const task = await storeService.createTask(userId, {
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'Planned',
      priority: priority || 'Medium',
      dueDate
    });

    return res.status(201).json({ success: true, message: 'Task created successfully', task });
  } catch (error) {
    console.error('[Create Task Error]', error);
    return res.status(500).json({ success: false, message: 'Server error creating task' });
  }
};

// Update task status (Planned, In Progress, Complete)
const updateTaskStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;
    const { status } = req.body;

    if (!status || !['Planned', 'In Progress', 'Complete'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Permitted values are Planned, In Progress, Complete'
      });
    }

    const task = await storeService.updateTaskStatus(taskId, userId, status);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
    }

    return res.status(200).json({ success: true, message: 'Task status updated', task });
  } catch (error) {
    console.error('[Update Task Status Error]', error);
    return res.status(500).json({ success: false, message: 'Server error updating task status' });
  }
};

// Full edit of task details
const updateTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;
    const { title, description, status, priority, dueDate } = req.body;

    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({ success: false, message: 'Task title cannot be empty' });
    }

    if (status && !['Planned', 'In Progress', 'Complete'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Planned, In Progress, or Complete' });
    }

    const updatedTask = await storeService.updateTask(taskId, userId, {
      title: title ? title.trim() : undefined,
      description,
      status,
      priority,
      dueDate
    });

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
    }

    return res.status(200).json({ success: true, message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    console.error('[Update Task Error]', error);
    return res.status(500).json({ success: false, message: 'Server error updating task' });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;

    const deleted = await storeService.deleteTask(taskId, userId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
    }

    return res.status(200).json({ success: true, message: 'Task deleted successfully', id: taskId });
  } catch (error) {
    console.error('[Delete Task Error]', error);
    return res.status(500).json({ success: false, message: 'Server error deleting task' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask
};
