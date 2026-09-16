const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const { getDbStatus } = require('../config/db');

// In-Memory fallback collections if MongoDB isn't running locally / Atlas URI isn't configured
const memoryUsers = [];
const memoryTasks = [];

const generateId = () => new mongoose.Types.ObjectId().toString();

const storeService = {
  // --- USER OPERATIONS ---
  async findOrCreateUserByGoogle({ googleId, email, name, picture }) {
    const { isConnected } = getDbStatus();
    let isNewUser = false;

    if (isConnected) {
      let user = await User.findOne({ googleId });
      if (!user) {
        user = await User.create({
          googleId,
          email,
          name,
          picture,
          authProvider: 'google',
          lastLogin: new Date()
        });
        isNewUser = true;
      } else {
        user.name = name;
        user.picture = picture;
        user.lastLogin = new Date();
        await user.save();
      }
      return { user, isNewUser };
    } else {
      let user = memoryUsers.find(u => u.googleId === googleId);
      if (!user) {
        user = {
          _id: generateId(),
          googleId,
          email,
          name,
          picture,
          authProvider: 'google',
          lastLogin: new Date(),
          createdAt: new Date()
        };
        memoryUsers.push(user);
        isNewUser = true;
      } else {
        user.name = name;
        user.picture = picture;
        user.lastLogin = new Date();
      }
      return { user, isNewUser };
    }
  },

  async findUserById(id) {
    const { isConnected } = getDbStatus();
    if (isConnected) {
      return await User.findById(id);
    } else {
      return memoryUsers.find(u => u._id.toString() === id.toString()) || null;
    }
  },

  // --- TASK OPERATIONS ---
  async getTasksByUser(userId, { status, search }) {
    const { isConnected } = getDbStatus();

    if (isConnected) {
      const query = { user: userId };
      if (status && ['Planned', 'In Progress', 'Complete'].includes(status)) {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      return await Task.find(query).sort({ createdAt: -1 });
    } else {
      let tasks = memoryTasks.filter(t => t.user.toString() === userId.toString());
      if (status && ['Planned', 'In Progress', 'Complete'].includes(status)) {
        tasks = tasks.filter(t => t.status === status);
      }
      if (search) {
        const term = search.toLowerCase();
        tasks = tasks.filter(t => 
          (t.title && t.title.toLowerCase().includes(term)) ||
          (t.description && t.description.toLowerCase().includes(term))
        );
      }
      return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async createTask(userId, { title, description, status, priority, dueDate }) {
    const { isConnected } = getDbStatus();

    const validStatus = ['Planned', 'In Progress', 'Complete'].includes(status) ? status : 'Planned';
    const validPriority = ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium';

    if (isConnected) {
      return await Task.create({
        user: userId,
        title,
        description: description || '',
        status: validStatus,
        priority: validPriority,
        dueDate: dueDate ? new Date(dueDate) : null
      });
    } else {
      const newTask = {
        _id: generateId(),
        user: userId.toString(),
        title,
        description: description || '',
        status: validStatus,
        priority: validPriority,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryTasks.push(newTask);
      return newTask;
    }
  },

  async updateTaskStatus(taskId, userId, status) {
    if (!['Planned', 'In Progress', 'Complete'].includes(status)) {
      throw new Error('Invalid status value. Must be Planned, In Progress, or Complete.');
    }

    const { isConnected } = getDbStatus();

    if (isConnected) {
      const task = await Task.findOne({ _id: taskId, user: userId });
      if (!task) return null;
      task.status = status;
      await task.save();
      return task;
    } else {
      const task = memoryTasks.find(t => t._id.toString() === taskId.toString() && t.user.toString() === userId.toString());
      if (!task) return null;
      task.status = status;
      task.updatedAt = new Date();
      return task;
    }
  },

  async updateTask(taskId, userId, updateData) {
    const { isConnected } = getDbStatus();

    if (updateData.status && !['Planned', 'In Progress', 'Complete'].includes(updateData.status)) {
      throw new Error('Invalid status value.');
    }

    if (isConnected) {
      const task = await Task.findOne({ _id: taskId, user: userId });
      if (!task) return null;
      
      if (updateData.title !== undefined) task.title = updateData.title;
      if (updateData.description !== undefined) task.description = updateData.description;
      if (updateData.status !== undefined) task.status = updateData.status;
      if (updateData.priority !== undefined) task.priority = updateData.priority;
      if (updateData.dueDate !== undefined) task.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;

      await task.save();
      return task;
    } else {
      const task = memoryTasks.find(t => t._id.toString() === taskId.toString() && t.user.toString() === userId.toString());
      if (!task) return null;

      if (updateData.title !== undefined) task.title = updateData.title;
      if (updateData.description !== undefined) task.description = updateData.description;
      if (updateData.status !== undefined) task.status = updateData.status;
      if (updateData.priority !== undefined) task.priority = updateData.priority;
      if (updateData.dueDate !== undefined) task.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;

      task.updatedAt = new Date();
      return task;
    }
  },

  async deleteTask(taskId, userId) {
    const { isConnected } = getDbStatus();

    if (isConnected) {
      const result = await Task.deleteOne({ _id: taskId, user: userId });
      return result.deletedCount > 0;
    } else {
      const index = memoryTasks.findIndex(t => t._id.toString() === taskId.toString() && t.user.toString() === userId.toString());
      if (index === -1) return false;
      memoryTasks.splice(index, 1);
      return true;
    }
  }
};

module.exports = storeService;
