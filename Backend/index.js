const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
 
dotenv.config();
 
const app = express();
 

// app.use(cors({
//   origin: 'http://localhost:4200', //'https://kanbanapp-task.netlify.app/',  
//   credentials: true
// }));


app.use(cors({
  origin: allowedOrigin,        // ✅ No trailing slash
  credentials: true             // ✅ If you send cookies or Authorization headers
}));

app.use(express.json());
 
// MongoDB Connection
connectDB();
 

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes); // Task routes


 
 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});