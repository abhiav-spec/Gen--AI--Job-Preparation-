import mongoose from 'mongoose';
import config from './config.js';

const connectDB = async () => {
    try {
        // Disable buffering so queries fail immediately if the DB is not connected
        mongoose.set('bufferCommands', false);
        
        await mongoose.connect(config.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of 10
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error (Neural bypass active):', error);
        // Do not crash during development if Atlas is down or blocked
        console.log('Server remaining active on port 3000 for UI diagnostics.');
    }
};

export default connectDB;