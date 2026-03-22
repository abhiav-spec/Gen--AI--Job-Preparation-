import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,   
        required: [true, 'Email is required'],
        // No unique constraint — a user may request multiple OTPs
    },
    otpHash: {
        type: String,
        required: [true, 'OTP is required'],        
    }   
}, { timestamps: true });

// Auto-delete OTP documents 10 minutes after creation
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

export default mongoose.model('Otp', otpSchema);