const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // For demo purposes, we'll use a simple in-memory MongoDB setup
    // In production, replace with your MongoDB connection string
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';
    
    // For WebContainer compatibility, we'll simulate a database connection
    console.log('📦 Simulating database connection...');
    console.log('✅ Database connected successfully (simulated)');
    
    // In a real application, uncomment the following:
    /*
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    */
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;