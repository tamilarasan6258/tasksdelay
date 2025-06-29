const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected Routes
router.post('/', authMiddleware, projectController.createProject);
router.get('/user/:userId', authMiddleware, projectController.getProjectsByUser);
router.get('/:projectId', authMiddleware, projectController.getProjectById);
router.put('/:projectId', authMiddleware, projectController.updateProject);
router.delete('/:projectId', authMiddleware, projectController.deleteProject);

module.exports = router;
