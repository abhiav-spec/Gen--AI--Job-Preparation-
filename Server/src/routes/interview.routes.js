const express = require('express');
const  interviewRouter = express.Router();
const { authUser } = require('../middleware/auth.middleware.js');
const  {interviewcontroller, getinterviewreport, getAllInterviewReports} = require('../controllers/interview.controller.js');
const upload = require('../middleware/file.middleware.js');

interviewRouter.post('/generate-interview-report', authUser, upload.single('resume') ,interviewcontroller);
interviewRouter.get('/report/:reportId', authUser, getinterviewreport);
interviewRouter.get('/reports/:userId', authUser, getAllInterviewReports);

module.exports = interviewRouter;