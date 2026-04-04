import { PDFParse as pdfparse } from 'pdf-parse';
import { generateInterviewReport, generateResumePdf, generatePdfFromHtml } from '../services/ai.service.js';
import interiviewReportModel from '../models/interviewReport.model.js';

function normalizeSkillGap(gap) {
    if (!gap || typeof gap !== 'object') {
        return null;
    }

    const skill = gap.skill ?? gap.name ?? gap.issue ?? gap.gap ?? gap.category ?? gap.area;
    const severity = ['low', 'medium', 'high'].includes(String(gap.severity).toLowerCase())
        ? String(gap.severity).toLowerCase()
        : 'medium';

    if (!skill || !String(skill).trim()) {
        return null;
    }

    return {
        skill: String(skill).trim(),
        severity,
    };
}

function normalizeReportPayload(report, fallbackTitle) {
    const normalizedSkillGaps = Array.isArray(report.skillGaps)
        ? report.skillGaps.map(normalizeSkillGap).filter(Boolean)
        : [];

    return {
        ...report,
        title: typeof report.title === 'string' && report.title.trim()
            ? report.title.trim()
            : fallbackTitle?.trim() || 'Interview Report',
        technicalQuestions: Array.isArray(report.technicalQuestions) ? report.technicalQuestions : [],
        behavioralQuestions: Array.isArray(report.behavioralQuestions) ? report.behavioralQuestions : [],
        skillGaps: normalizedSkillGaps,
        preparationPlan: Array.isArray(report.preparationPlan) ? report.preparationPlan : [],
        matchScore: Number.isFinite(Number(report.matchScore)) ? Number(report.matchScore) : 0,
    };
}

function buildReportHighlights(report) {
    return [
        {
            label: 'Match Score',
            value: `${report.matchScore ?? 0}%`,
            note: 'Overall role alignment',
        },
        {
            label: 'Technical Qs',
            value: String(report.technicalQuestions?.length ?? 0),
            note: 'Interview preparation set',
        },
        {
            label: 'Skill Gaps',
            value: String(report.skillGaps?.length ?? 0),
            note: 'Areas to improve',
        },
        {
            label: 'Prep Plan',
            value: `${report.preparationPlan?.length ?? 0} days`,
            note: 'Day-wise preparation plan',
        },
    ];
}

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
        const normalizedReport = normalizeReportPayload(report, jobdescription);

        const { html: generatedResumeHtml } = await generateResumePdf({
            resume: resumeText,
            selfDescription: selfdescription,
            jobDescription: jobdescription,
        });

        const interviewReport = new interiviewReportModel({
            user: req.user.id,
            resume: resumeText,
            selfDescription: selfdescription,
            jobDescription: jobdescription,
            generatedResumeHtml,
            ...normalizedReport
        });
        await interviewReport.save();
        return res.status(200).json({
            message: 'Interview report generated successfully',
            success: true,
            data: {
                ...normalizedReport,
                reportId: interviewReport._id,
                highlights: buildReportHighlights(normalizedReport),
            }
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
            .select('-resume -generatedResumeHtml -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan')
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

        let pdfContent;

        if (report.generatedResumeHtml) {
            pdfContent = await generatePdfFromHtml(report.generatedResumeHtml);
        } else {
            const generated = await generateResumePdf({
                resume: report.resume,
                selfDescription: report.selfDescription,
                jobDescription: report.jobDescription,
            });
            pdfContent = generated.pdfBuffer;
        }

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=generated_resume_${reportId}.pdf`,
        });

        return res.send(pdfContent);
    } catch (error) {
        console.error('Error downloading interview report:', error);
        return res.status(500).json({ error: 'Failed to download interview report' });
    }
}

export { interviewcontroller, getinterviewreport, getAllInterviewReports, downloadInterviewReport, normalizeReportPayload }