const mongoose = require('mongoose');

let isConnected = false;
let isInMemoryFallback = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kovai_task';
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      dbName: 'kovai_task', // Force Mongoose to connect directly to kovai_task database
      serverSelectionTimeoutMS: 3000 // 3 seconds timeout before fallback
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected Successfully: ${mongoose.connection.host} (DB: ${mongoose.connection.name})`);
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MongoDB at ${uri}: ${error.message}`);
    console.warn(`[Database Warning] Activating robust In-Memory Store Fallback for instant evaluation & testing.`);
    isInMemoryFallback = true;
  }
};

const getDbStatus = () => ({
  isConnected,
  isInMemoryFallback
});

module.exports = { connectDB, getDbStatus };
