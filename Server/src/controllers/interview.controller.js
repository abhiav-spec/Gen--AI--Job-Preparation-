import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfparse = require('pdf-parse');
import { generateInterviewReport, generateResumePdf } from '../services/ai.service.js';
import interiviewReportModel from '../models/interviewReport.model.js';



async function interviewcontroller(req,res) {
    const resumeFile = req.file;

    const resumecontent = await (new pdfparse.PDFParse(Uint8Array.from(resumeFile.buffer))).getText();

    const { selfdescription, jobdescription } = req.body;

    if (!resumecontent || !selfdescription || !jobdescription) {
        return res.status(400).json({ 
            error: 'Missing required fields: resume, selfdescription, jobdescription' 
        });
    }

    try {
        const report = await generateInterviewReport({
            resume: resumecontent.text,
            selfdescription,
            jobdescription
        });

        const interviewReport = new interiviewReportModel({
            user: req.user.id,
            resume: resumecontent.text,
            selfDescription: selfdescription,
            jobDescription: jobdescription,
            ...report
        });
        await interviewReport.save();
        return res.status(200).json({ 
            message: 'Interview report generated successfully', 
            success: true, 
            data: report 
        });
    } catch (error) {
        console.error('Error generating interview report:', error);
        return res.status(500).json({ error: 'Failed to generate interview report' });
    }
}


async function getinterviewreport(req,res) {
    const reportId = req.params.reportId;

    try {
        const report = await interiviewReportModel.findOne({ _id: reportId, user: req.user.id });
        if (!report) {
            return res.status(404).json({ error: 'Interview report not found' });
        }
        return res.status(200).json({ 
            message: 'Interview report retrieved successfully', 
            success: true, 
            data: report 
        });
    } catch (error) {
        console.error('Error retrieving interview report:', error);
        return res.status(500).json({ error: 'Failed to retrieve interview report' });
    }
}

async function getAllInterviewReports(req,res) {
    try {
        const reports = await interiviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select('-resume -selfDescription -jobDescription -_v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan'); // Exclude resume content for listing
        return res.status(200).json({ 
            message: 'Interview reports retrieved successfully', 
            success: true, 
            data: reports 
        });
    } catch (error) {
        console.error('Error retrieving interview reports:', error);
        return res.status(500).json({ error: 'Failed to retrieve interview reports' });
    }
}

async function downloadInterviewReport(req, res) {
    const reportId = req.params.reportId;

    try {
        const report = await interiviewReportModel.findOne({ _id: reportId, user: req.user.id });
        if (!report) {
            return res.status(404).json({ error: 'Interview report not found' });
        }

        const {resume, selfDescription, jobDescription, technicalQuestions, behavioralQuestions, skillGaps, preparationPlan} = report;

        const pdfContent = await generateResumePdf({ resume, selfDescription, jobDescription, technicalQuestions, behavioralQuestions, skillGaps, preparationPlan });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=interview_report_${reportId}.pdf`,
        });

        return res.send(pdfContent);
    } catch (error) {
        console.error('Error downloading interview report:', error);
        return res.status(500).json({ error: 'Failed to download interview report' });
    }
}

export { interviewcontroller, getinterviewreport, getAllInterviewReports, downloadInterviewReport }