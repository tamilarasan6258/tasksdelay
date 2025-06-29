const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');
 
// Auth: Register & Login
router.post('/register', authController.register);
router.post('/login', authController.login);

// OTP routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
 
// Change password
router.put('/change-password', authMiddleware, authController.changePassword);

// Username/Email validation (these don't need authentication)
router.post('/check-username-email', authController.checkUsernameEmail);
router.post('/check-username', authController.checkUsername);

// Username updating
router.put('/update-username', authMiddleware, authController.updateUsername);
 
module.exports = router; //Exports the router object so it can be used in index.js: [  app.use('/api/auth', authRoutes);   ]