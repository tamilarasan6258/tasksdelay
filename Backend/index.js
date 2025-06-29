const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes')
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Load environment variables
dotenv.config();
 
// Initialize express app - starting point of backend server
const app = express();

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200', 
  credentials: true         //allows aut headers to be sent across domains
}));

// Built-in Middleware to parse JSON request bodies(wihtout this req.body is undefined)
app.use(express.json());
 
// MongoDB Connection
connectDB();
 
// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordResetRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes); 

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});