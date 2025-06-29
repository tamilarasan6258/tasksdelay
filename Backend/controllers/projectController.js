const Project = require('../models/projectModel');

// Create Project
exports.createProject = async (req, res) => {
  const { projectName, projectDesc, dueDate, userId } = req.body;

  try {
    const newProject = new Project({
      projectName,
      projectDesc,
      dueDate,
      user: userId,
    });

    await newProject.save();

    res.status(201).json({
      msg: 'Project created successfully',
      project: newProject
    });
  } catch (err) {
    console.error('Create Project Error:', err.message);
    res.status(500).json({ msg: 'Server error while creating project' });
  }
};

// Get all projects for a user
exports.getProjectsByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const projects = await Project.find({ user: userId }).sort({ dueDate: 1 });
    res.json(projects);
  } catch (err) {
    console.error('Fetch Projects Error:', err.message);
    res.status(500).json({ msg: 'Server error while fetching projects' });
  }
};


// Get a single project by its ID
exports.getProjectById = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findById(projectId).populate('user', 'uname email');
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    console.error('Get Project Error:', err.message);
    res.status(500).json({ msg: 'Server error while retrieving project' });
  }
};

// Update a project by ID
exports.updateProject = async (req, res) => {
  const projectId = req.params.projectId;
  const { projectName, projectDesc, dueDate } = req.body;

  try {
    const updated = await Project.findByIdAndUpdate(
      projectId,
      { projectName, projectDesc, dueDate },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    res.json({
      msg: 'Project updated successfully',
      project: updated
    });
  } catch (err) {
    console.error('Update Project Error:', err.message);
    res.status(500).json({ msg: 'Server error while updating project' });
  }
};

// Delete a project by ID
exports.deleteProject = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const deleted = await Project.findByIdAndDelete(projectId);
    if (!deleted) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    res.json({ msg: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete Project Error:', err.message);
    res.status(500).json({ msg: 'Server error while deleting project' });
  }
};
