import MockInterview from '../models/mockInterview.model.js';
import {
    generateFirstQuestion,
    evaluateAndNextQuestion,
    generateFinalReport,
} from '../services/mockInterview.service.js';
import { createNotification } from './notification.controller.js';

// ─── Start a new mock interview session ──────────────────────────────────────

async function startInterview(req, res) {
    try {
        const { role, difficulty, duration, jobDescription } = req.body;

        if (!role?.trim() || !jobDescription?.trim()) {
            return res.status(400).json({
                error: 'Missing required fields: role and jobDescription are required.',
            });
        }

        const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
        const diff = validDifficulties.includes(difficulty?.toUpperCase())
            ? difficulty.toUpperCase()
            : 'MEDIUM';

        // Generate first question from AI
        const firstQ = await generateFirstQuestion({
            role: role.trim(),
            difficulty: diff,
            jobDescription: jobDescription.trim(),
        });

        // Create session in DB
        const session = new MockInterview({
            user: req.user.id,
            role: role.trim(),
            difficulty: diff,
            duration: Number(duration) || 15,
            jobDescription: jobDescription.trim(),
            qaHistory: [{
                question: firstQ.question,
                askedAt: new Date(),
            }],
        });

        await session.save();

        return res.status(201).json({
            success: true,
            message: 'Mock interview started.',
            data: {
                sessionId: session._id,
                role: session.role,
                difficulty: session.difficulty,
                duration: session.duration,
                question: firstQ.question,
                questionNumber: 1,
                startedAt: session.startedAt,
            },
        });
    } catch (error) {
        console.error('Error starting mock interview:', error);
        if (error.status === 429) {
            return res.status(429).json({
                error: 'AI service quota exceeded. Please wait and try again.',
            });
        }
        return res.status(500).json({
            error: 'Failed to start mock interview.',
            details: error.message,
        });
    }
}

// ─── Submit answer to current question and get next question ─────────────────

async function submitAnswer(req, res) {
    try {
        const { sessionId } = req.params;
        const { answer } = req.body;

        if (!answer?.trim()) {
            return res.status(400).json({ error: 'Answer is required.' });
        }

        const session = await MockInterview.findOne({
            _id: sessionId,
            user: req.user.id,
            status: 'active',
        });

        if (!session) {
            return res.status(404).json({ error: 'Active interview session not found.' });
        }

        // Update the last entry with the candidate's answer
        const lastIdx = session.qaHistory.length - 1;
        session.qaHistory[lastIdx].answer = answer.trim();
        session.qaHistory[lastIdx].answeredAt = new Date();

        // Generate evaluation + next question
        const result = await evaluateAndNextQuestion({
            role: session.role,
            difficulty: session.difficulty,
            jobDescription: session.jobDescription,
            qaHistory: session.qaHistory,
            latestAnswer: answer.trim(),
        });

        // Save evaluation for the just-answered question
        if (result.evaluation) {
            session.qaHistory[lastIdx].evaluation = {
                technicalAccuracy: result.evaluation.technicalAccuracy || 0,
                depthOfKnowledge: result.evaluation.depthOfKnowledge || 0,
                communicationClarity: result.evaluation.communicationClarity || 0,
                confidence: result.evaluation.confidence || 0,
            };
        }

        // Push the new question
        session.qaHistory.push({
            question: result.question,
            askedAt: new Date(),
        });

        await session.save();

        return res.status(200).json({
            success: true,
            data: {
                sessionId: session._id,
                question: result.question,
                questionNumber: session.qaHistory.length,
                totalAnswered: session.qaHistory.length - 1,
            },
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
        if (error.status === 429) {
            return res.status(429).json({
                error: 'AI service quota exceeded. Please wait and try again.',
            });
        }
        return res.status(500).json({
            error: 'Failed to process answer.',
            details: error.message,
        });
    }
}

// ─── End the interview and generate final report ─────────────────────────────

async function endInterview(req, res) {
    try {
        const { sessionId } = req.params;
        const { lastAnswer, behaviorReport } = req.body;

        const metrics = behaviorReport?.metrics || {
            faceMissingDuration: 0,
            faceMissingCount: 0,
            averageConfidence: 0,
            dominantEmotion: 'neutral'
        };

        const session = await MockInterview.findOne({
            _id: sessionId,
            user: req.user.id,
            status: 'active',
        });

        if (!session) {
            return res.status(404).json({ error: 'Active interview session not found.' });
        }

        // If there's a pending answer for the last question, save it
        const lastIdx = session.qaHistory.length - 1;
        if (lastAnswer?.trim() && !session.qaHistory[lastIdx].answer) {
            session.qaHistory[lastIdx].answer = lastAnswer.trim();
            session.qaHistory[lastIdx].answeredAt = new Date();
        }

        // Generate final report
        const report = await generateFinalReport({
            role: session.role,
            difficulty: session.difficulty,
            jobDescription: session.jobDescription,
            qaHistory: session.qaHistory,
            behaviorMetrics: metrics
        });

        session.behaviorMetrics = metrics;

        session.finalReport = report;
        session.status = 'completed';
        session.endedAt = new Date();
        await session.save();

        // Create notification for the user
        await createNotification({
            userId: req.user.id,
            type: 'MOCK_INTERVIEW',
            title: 'Mock Interview Complete!',
            message: `Your AI report for ${session.role} is ready for review.`,
            link: `/dashboard/mock-interview/${sessionId}/report`
        });

        return res.status(200).json({
            success: true,
            message: 'Interview completed. Report generated.',
            data: {
                sessionId: session._id,
                report,
                qaHistory: session.qaHistory,
                duration: session.duration,
                role: session.role,
                difficulty: session.difficulty,
            },
        });
    } catch (error) {
        console.error('Error ending mock interview:', error);
        return res.status(500).json({
            error: 'Failed to generate interview report.',
            details: error.message,
        });
    }
}

// ─── Get a single session with full details ──────────────────────────────────

async function getSession(req, res) {
    try {
        const { sessionId } = req.params;
        const session = await MockInterview.findOne({
            _id: sessionId,
            user: req.user.id,
        });

        if (!session) {
            return res.status(404).json({ error: 'Interview session not found.' });
        }

        return res.status(200).json({
            success: true,
            data: session,
        });
    } catch (error) {
        console.error('Error fetching session:', error);
        return res.status(500).json({ error: 'Failed to fetch session.' });
    }
}

// ─── Get all sessions for the current user ───────────────────────────────────

async function getAllSessions(req, res) {
    try {
        const sessions = await MockInterview.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select('role difficulty duration status startedAt endedAt qaHistory finalReport.score behaviorMetrics createdAt');

        return res.status(200).json({
            success: true,
            data: sessions,
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return res.status(500).json({ error: 'Failed to fetch sessions.' });
    }
}

// ─── Delete a session permanently ───────────────────────────────────────────

async function deleteInterview(req, res) {
    try {
        const { sessionId } = req.params;
        const session = await MockInterview.findOneAndDelete({
            _id: sessionId,
            user: req.user.id,
        });

        if (!session) {
            return res.status(404).json({ error: 'Interview session not found or unauthorized.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Interview session deleted permanently.',
        });
    } catch (error) {
        console.error('Error deleting mock interview:', error);
        return res.status(500).json({
            error: 'Failed to delete interview record.',
            details: error.message,
        });
    }
}

export { startInterview, submitAnswer, endInterview, getSession, getAllSessions, deleteInterview };
