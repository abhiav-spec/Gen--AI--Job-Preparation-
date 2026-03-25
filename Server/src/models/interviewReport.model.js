const mongoose = require('mongoose');

// --- Sub-schemas ---

const technicalQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    intention: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
}, { _id: false });

const behavioralQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    intention: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
}, { _id: false });

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    }
}, { _id: false });

const preparationPlanSchema = new mongoose.Schema({
    days: {
        type: Number,
        required: true
    },
    focus: {
        type: String,
        required: true
    },
    tasks: [{
        type: String,
        required: true
    }]
}, { _id: false });

// --- Main Schema ---

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: true
    },
    resume: {
        type: String
    },
    selfDescription: {
        type: String
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 10
    },
    technicalQuestions: [technicalQuestionsSchema],
    behavioralQuestions: [behavioralQuestionsSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Export the model
module.exports = mongoose.model('InterviewReport', interviewReportSchema);