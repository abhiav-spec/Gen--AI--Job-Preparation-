import express from 'express';
const interviewRouter = express.Router();
import { authUser } from '../middleware/auth.middleware.js';
import { interviewcontroller, getinterviewreport, getAllInterviewReports, downloadInterviewReport } from '../controllers/interview.controller.js';
import upload from '../middleware/file.middleware.js';

interviewRouter.post('/generate-interview-report', authUser, upload.single('resume') ,interviewcontroller);
interviewRouter.get('/report/:reportId', authUser, getinterviewreport);
interviewRouter.get('/reports/:userId', authUser, getAllInterviewReports);
interviewRouter.get('/download-report/:reportId', authUser, downloadInterviewReport);
// interviewRouter.get('/generate-resume-pdf', authUser, )
export default interviewRouter;