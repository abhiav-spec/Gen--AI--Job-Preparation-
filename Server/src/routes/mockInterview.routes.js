import express from 'express';
import { authUser } from '../middleware/auth.middleware.js';
import {
    startInterview,
    submitAnswer,
    endInterview,
    getSession,
    getAllSessions,
    deleteInterview,
} from '../controllers/mockInterview.controller.js';

const mockInterviewRouter = express.Router();

// IMPORTANT: Static routes MUST come before parametric :sessionId routes

// POST   /api/mock-interview/start              — Start a new session
mockInterviewRouter.post('/start', authUser, startInterview);

// GET    /api/mock-interview/sessions/all        — Get all user sessions
mockInterviewRouter.get('/sessions/all', authUser, getAllSessions);

// POST   /api/mock-interview/:sessionId/answer   — Submit answer, get next Q
mockInterviewRouter.post('/:sessionId/answer', authUser, submitAnswer);

// POST   /api/mock-interview/:sessionId/end      — End interview, get report
mockInterviewRouter.post('/:sessionId/end', authUser, endInterview);

// DELETE /api/mock-interview/:sessionId           — Remove session permanently
mockInterviewRouter.delete('/:sessionId', authUser, deleteInterview);

// GET    /api/mock-interview/:sessionId           — Get single session details
mockInterviewRouter.get('/:sessionId', authUser, getSession);

export default mockInterviewRouter;
