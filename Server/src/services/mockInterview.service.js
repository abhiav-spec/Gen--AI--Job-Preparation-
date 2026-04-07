import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// ─── Helper: Chat completion with JSON mode ─────────────────────────────────

async function chatJson(messages) {
    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 4096,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error('Groq returned an empty response.');
    return JSON.parse(raw);
}

// ─── Build context from history ──────────────────────────────────────────────

function buildHistoryContext(qaHistory) {
    if (!qaHistory || qaHistory.length === 0) return '';
    return qaHistory.map((qa, i) =>
        `Q${i + 1}: ${qa.question}\nCandidate Answer: ${qa.answer || '(no answer yet)'}`
    ).join('\n\n');
}

// ─── Generate First Question ─────────────────────────────────────────────────

async function generateFirstQuestion({ role, difficulty, jobDescription }) {
    const systemPrompt = `You are an advanced AI Interviewer conducting a real-time mock interview.
Your behavior must strictly simulate a professional human interviewer.

CONTEXT:
- Role: ${role}
- Difficulty Level: ${difficulty}
- Job Description: ${jobDescription}

DIFFICULTY RULES:
- EASY: Ask basic concept questions, definitions and simple examples
- MEDIUM: Ask practical and scenario-based questions, include problem-solving
- HARD: Ask deep technical, system design, and optimization questions, include edge cases and real-world challenges

Start with a warm introduction and ask your FIRST interview question. The question should be an introduction/warm-up question appropriate for the role.

You MUST respond with ONLY a valid JSON object in this exact format:
{
  "type": "question",
  "question": "Your question here"
}

Do NOT include any text outside the JSON object.`;

    const result = await chatJson([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Please begin the interview.' },
    ]);

    return result;
}

// ─── Evaluate Answer & Generate Next Question ────────────────────────────────

async function evaluateAndNextQuestion({ role, difficulty, jobDescription, qaHistory, latestAnswer }) {
    const historyContext = buildHistoryContext(qaHistory);
    
    const systemPrompt = `You are an advanced AI Interviewer conducting a real-time mock interview.
Your behavior must strictly simulate a professional human interviewer.

CONTEXT:
- Role: ${role}
- Difficulty Level: ${difficulty}
- Job Description: ${jobDescription}

DIFFICULTY RULES:
- EASY: Ask basic concept questions, definitions and simple examples
- MEDIUM: Ask practical and scenario-based questions, include problem-solving
- HARD: Ask deep technical, system design, and optimization questions, include edge cases and real-world challenges

INTERVIEW HISTORY SO FAR:
${historyContext}

The candidate just answered the last question with: "${latestAnswer}"

INSTRUCTIONS:
1. Internally evaluate the candidate's latest answer for: technical accuracy, depth of knowledge, communication clarity, and confidence (scores 0-10 each).
2. Based on the evaluation and conversation flow, ask ONE follow-up or next question.
3. Adapt the difficulty based on how well the candidate is performing.
4. Prefer real-world scenarios from the job description.
5. Do NOT repeat questions already asked.

You MUST respond with ONLY a valid JSON object in this exact format:
{
  "type": "question",
  "question": "Your next question here",
  "evaluation": {
    "technicalAccuracy": <number 0-10>,
    "depthOfKnowledge": <number 0-10>,
    "communicationClarity": <number 0-10>,
    "confidence": <number 0-10>
  }
}

Do NOT include any text outside the JSON object.`;

    const result = await chatJson([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `The candidate answered: "${latestAnswer}". Please evaluate and ask the next question.` },
    ]);

    return result;
}

// ─── Generate Final Report ───────────────────────────────────────────────────

async function generateFinalReport({ role, difficulty, jobDescription, qaHistory, behaviorMetrics }) {
    const historyContext = buildHistoryContext(qaHistory);

    const systemPrompt = `You are an advanced AI Interviewer. The mock interview has just ended.

CONTEXT:
- Role: ${role}
- Difficulty Level: ${difficulty}
- Job Description: ${jobDescription}

COMPLETE INTERVIEW TRANSCRIPT:
${historyContext}

BEHAVIORAL PERFORMANCE METRICS (Vision AI):
- Total Face Missing Duration: ${behaviorMetrics?.faceMissingDuration || 0} seconds
- Face Disappeared Count: ${behaviorMetrics?.faceMissingCount || 0} times
- Average AI Confidence in Candidate: ${behaviorMetrics?.averageConfidence || 0}%
- Dominant Emotion Detected: ${behaviorMetrics?.dominantEmotion || 'neutral'}

Generate a detailed final interview evaluation report. Analyze the candidate's overall performance across all questions, factoring in their physical presence and behavior metrics.

You MUST respond with ONLY a valid JSON object in this exact format:
{
  "score": {
    "overall": <number 0-10>,
    "technical": <number 0-10>,
    "communication": <number 0-10>,
    "confidence": <number 0-10>
  },
  "technicalQuestions": "<Detailed paragraph analysis of technical performance across all questions>",
  "behavioralQuestions": "<Detailed paragraph evaluation of behavior, soft skills, and how the candidate presented themselves>",
  "skillGaps": "<Detailed paragraph listing missing or weak skills based on the job description>",
  "preparationPlan": "<Detailed step-by-step improvement plan with specific resources and timelines>",
  "resumeFeedback": "<Specific suggestions to improve resume for this role based on interview performance>",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"]
}

Be thorough, specific, and constructive. Reference actual answers from the interview. Do NOT include any text outside the JSON object.`;

    const result = await chatJson([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'The interview has ended. Please generate the final evaluation report.' },
    ]);

    return result;
}

export { generateFirstQuestion, evaluateAndNextQuestion, generateFinalReport };
