const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

router.post('/forgot-password', passwordResetController.requestPasswordReset);
router.post('/reset-password/:token', passwordResetController.resetPassword);

module.exports = router;
