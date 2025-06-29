const Task = require('../models/taskModel');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json({ msg: 'Task created successfully', task });
  } catch (err) {
    console.error('Task creation error:', err.message);
    res.status(500).json({ msg: 'Failed to create task' });
  }
};




// Get all tasks (optionally filtered by project ID)
exports.getTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }
    const tasks = await Task.find(filter).populate('project', 'projectName');
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).json({ msg: 'Failed to retrieve tasks' });
  }
};




// Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err.message);
    res.status(500).json({ msg: 'Failed to fetch task' });
  }
};

// Update a task by ID
exports.updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json({ msg: 'Task updated', task: updated });
  } catch (err) {
    console.error('Task update error:', err.message);
    res.status(500).json({ msg: 'Failed to update task' });
  }
};

// Delete a task by ID
exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json({ msg: 'Task deleted' });
  } catch (err) {
    console.error('Task delete error:', err.message);
    res.status(500).json({ msg: 'Failed to delete task' });
  }
};
