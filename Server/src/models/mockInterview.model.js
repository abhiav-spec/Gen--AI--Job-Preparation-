import mongoose from 'mongoose';

const qaEntrySchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, default: '' },
    // Internal scoring per answer (not shown to user until report)
    evaluation: {
        technicalAccuracy: { type: Number, min: 0, max: 10, default: 0 },
        depthOfKnowledge: { type: Number, min: 0, max: 10, default: 0 },
        communicationClarity: { type: Number, min: 0, max: 10, default: 0 },
        confidence: { type: Number, min: 0, max: 10, default: 0 },
    },
    askedAt: { type: Date, default: Date.now },
    answeredAt: { type: Date },
}, { _id: false });

const finalReportSchema = new mongoose.Schema({
    score: {
        overall: { type: Number, min: 0, max: 10 },
        technical: { type: Number, min: 0, max: 10 },
        communication: { type: Number, min: 0, max: 10 },
        confidence: { type: Number, min: 0, max: 10 },
    },
    technicalQuestions: { type: String },
    behavioralQuestions: { type: String },
    skillGaps: { type: String },
    preparationPlan: { type: String },
    resumeFeedback: { type: String },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
}, { _id: false });

const mockInterviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        required: true,
        trim: true,
    },
    difficulty: {
        type: String,
        enum: ['EASY', 'MEDIUM', 'HARD'],
        default: 'MEDIUM',
    },
    duration: {
        type: Number, // in minutes
        default: 15,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active',
    },
    qaHistory: [qaEntrySchema],
    finalReport: finalReportSchema,
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('MockInterview', mockInterviewSchema);
