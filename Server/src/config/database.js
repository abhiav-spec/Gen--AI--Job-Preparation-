import mongoose from 'mongoose';
import config from './config.js';

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error (Neural bypass active):', error.message);
        console.log('Server remaining active on port 3000 for UI diagnostics.');
    }
};

export default connectDB;