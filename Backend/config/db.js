const mongoose = require('mongoose');

const connectDB = async () => {
  try 
  {
    await mongoose.connect(process.env.MONGO_URI, { //MONGO_URI defined in .env
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } 
  catch (error) {
    console.error(error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
