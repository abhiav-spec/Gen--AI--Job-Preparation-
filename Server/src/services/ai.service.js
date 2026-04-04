import Groq from 'groq-sdk';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import puppeteer from 'puppeteer';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// ─── Schemas ────────────────────────────────────────────────────────────────

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
});

const resumeHtmlSchema = z.object({
    html: z.string().describe('Complete, self-contained HTML content of the resume'),
});

// ─── Helper: call Groq with JSON mode ───────────────────────────────────────

async function callGroqJson(systemPrompt, userPrompt, schema) {
    const jsonSchema = zodToJsonSchema(schema, { name: 'output', nameStrategy: 'title' });

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 8192,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error('Groq returned an empty response.');

    return JSON.parse(raw);
}

// ─── Generate Interview Report ───────────────────────────────────────────────

async function generateInterviewReport({ resume, selfdescription, jobdescription }) {
    const systemPrompt = `You are an expert technical recruiter and interview coach.
You must respond with a VALID JSON object that exactly matches this schema:
${JSON.stringify(zodToJsonSchema(interviewReportSchema), null, 2)}

Rules:
- matchScore: integer 0–100
- technicalQuestions: exactly 10 items, each with question, intention, answer
- behavioralQuestions: exactly 5 items, each with question, intention, answer  
- skillGaps: list relevant gaps with severity "low"|"medium"|"high"
- preparationPlan: 7 days, each with day (number), focus (string), tasks (array of strings)
- title: the job title string
Respond ONLY with the JSON object, no markdown or explanation.`;

    const userPrompt = `Analyze this candidate and generate a comprehensive interview report.

RESUME:
${resume}

SELF DESCRIPTION:
${selfdescription}

JOB DESCRIPTION:
${jobdescription}`;

    const result = await callGroqJson(systemPrompt, userPrompt, interviewReportSchema);

    // Validate with zod
    const parsed = interviewReportSchema.safeParse(result);
    if (!parsed.success) {
        console.warn('Groq response did not pass full schema validation, using raw result:', parsed.error.issues);
    }

    return result;
}

// ─── Generate PDF from HTML ──────────────────────────────────────────────────

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' },
        printBackground: true,
    });

    await browser.close();
    return pdfBuffer;
}

// ─── Generate Resume PDF ─────────────────────────────────────────────────────

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const systemPrompt = `You are a professional resume writer and UI designer.
You must respond with a VALID JSON object with a single key "html" containing a complete, self-contained HTML resume.

Rules for the HTML:
- Include all CSS inside a <style> tag (no external stylesheets)
- Make it ATS-friendly and visually professional
- Use a clean, modern single-column or two-column layout
- Include sections: Contact, Summary, Skills, Experience, Education, Projects
- Tailor content to the job description
- Max 2 pages when printed to A4
- Use ONLY the "html" key in your JSON response
Respond ONLY with the JSON object, no markdown or explanation.`;

    const userPrompt = `Create a tailored, professional resume in HTML format.

ORIGINAL RESUME CONTENT:
${resume}

SELF DESCRIPTION:
${selfDescription}

TARGET JOB DESCRIPTION:
${jobDescription}`;

    const result = await callGroqJson(systemPrompt, userPrompt, resumeHtmlSchema);

    if (!result.html || typeof result.html !== 'string') {
        throw new Error('Groq did not return valid HTML content for the resume.');
    }

    const pdfBuffer = await generatePdfFromHtml(result.html);
    return {
        html: result.html,
        pdfBuffer,
    };
}

export { generateInterviewReport, generateResumePdf, generatePdfFromHtml };