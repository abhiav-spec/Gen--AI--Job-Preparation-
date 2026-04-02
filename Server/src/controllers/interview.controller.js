import { PDFParse as pdfparse } from 'pdf-parse';
import { generateInterviewReport, generateResumePdf } from '../services/ai.service.js';
import interiviewReportModel from '../models/interviewReport.model.js';

async function interviewcontroller(req, res) {
    console.log('--- ENTERING INTERVIEW CONTROLLER ---');
    console.log('Request body:', req.body);
    console.log('Request file present:', !!req.file);
    const { selfdescription, jobdescription } = req.body;

    let resumeText = '';

    // Use the uploaded file
    const resumeFile = req.file;
    if (!resumeFile) {
        return res.status(400).json({ error: 'No resume file provided. Please upload a PDF file.' });
    }
    try {
        const parser = new pdfparse({ data: resumeFile.buffer });
        const result = await parser.getText();
        resumeText = result.text?.trim() || '';
        if (!resumeText || resumeText.length < 10) {
            return res.status(400).json({ error: 'Resume PDF appears to be empty or unreadable. Please upload a valid resume PDF with text.' });
        }
    } catch (e) {
        console.error('PDF parse error:', e.message);
        return res.status(400).json({ error: `Failed to parse PDF: ${e.message || 'Invalid PDF format'}. Please upload a valid PDF file.` });
    }



    if (!selfdescription?.trim() || !jobdescription?.trim()) {
        return res.status(400).json({
            error: 'Missing required fields: selfdescription and jobdescription are required'
        });
    }

    if (!resumeText) {
        return res.status(400).json({
            error: 'Resume content is empty or could not be extracted'
        });
    }

    try {
        const report = await generateInterviewReport({
            resume: resumeText,
            selfdescription,
            jobdescription
        });

        const interviewReport = new interiviewReportModel({
            user: req.user.id,
            resume: resumeText,
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
        // Handle API quota / rate limit errors specifically
        if (error.status === 429) {
            return res.status(429).json({
                error: 'AI service quota exceeded. Please wait a moment and try again, or check your Google AI API billing.',
                details: error.message
            });
        }
        return res.status(500).json({ error: 'Failed to generate interview report', details: error.message });
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
    // --- MOCK FALLBACK FOR DEVELOPMENT ---
    const isMockUser = req.user.id === '65f1a2b3c4d5e6f7a8b9c0d1';

    try {
        const reports = await interiviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select('-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan')
            .catch(err => {
                if (isMockUser) {
                    console.warn('⚠️ DB Connection failed. Returning Neural Mock Reports for UI testing.');
                    return null;
                }
                throw err;
            });

        if (!reports && isMockUser) {
            const mockReports = [
                {
                    _id: 'mock_report_1',
                    title: 'Software Engineer - Neural Systems',
                    matchScore: 88,
                    createdAt: new Date().toISOString()
                },
                {
                    _id: 'mock_report_2',
                    title: 'Backend Developer - Kinetic Core',
                    matchScore: 74,
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                }
            ];
            return res.status(200).json({ 
                message: 'Interview reports retrieved successfully (Neural Mock)', 
                success: true, 
                data: mockReports 
            });
        }

        return res.status(200).json({ 
            message: 'Interview reports retrieved successfully', 
            success: true, 
            data: reports || [] 
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