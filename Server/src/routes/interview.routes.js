import express from 'express';
const interviewRouter = express.Router();
import { authUser } from '../middleware/auth.middleware.js';
import { 
    interviewcontroller, 
    getinterviewreport, 
    getAllInterviewReports, 
    downloadInterviewReport,
    deleteInterviewReport,
    getPublicInterviewReport
} from '../controllers/interview.controller.js';
import upload from '../middleware/file.middleware.js';

interviewRouter.post('/generate-interview-report', authUser, upload.single('resume') ,interviewcontroller);
interviewRouter.get('/report/:reportId', authUser, getinterviewreport);
interviewRouter.get('/reports/:userId', authUser, getAllInterviewReports);
interviewRouter.delete('/report/:reportId', authUser, deleteInterviewReport);
interviewRouter.get('/download-report/:reportId', authUser, downloadInterviewReport);

// PUBLIC ROUTES (No Auth)
interviewRouter.get('/public/report/:reportId', getPublicInterviewReport);
interviewRouter.get('/public/download-report/:reportId', downloadInterviewReport);
// interviewRouter.get('/generate-resume-pdf', authUser, )
export default interviewRouter;