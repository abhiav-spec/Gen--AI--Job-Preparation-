export const generateReportHtml = (reportData) => {
  const { 
    type = 'analysis', 
    title, 
    matchScore, 
    technicalQuestions = [], 
    behavioralQuestions = [], 
    skillGaps = [], 
    preparationPlan = [],
    behaviorMetrics = null,
    qaHistory = [],
    role,
    difficulty,
    score
  } = reportData;

  const primaryColor = '#5de6ff';
  const secondaryColor = '#c0c1ff';
  const darkBg = '#0c0c1d';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@500;700&display=swap');
            
            body {
                font-family: 'Inter', sans-serif;
                background-color: white;
                color: #1e293b;
                margin: 0;
                padding: 40px;
                line-height: 1.6;
            }

            .header {
                border-bottom: 2px solid ${primaryColor};
                padding-bottom: 20px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .title-section h1 {
                font-family: 'Space+Grotesk', sans-serif;
                font-size: 28px;
                margin: 0;
                color: ${darkBg};
            }

            .score-badge {
                background: ${darkBg};
                color: white;
                padding: 10px 20px;
                border-radius: 12px;
                text-align: center;
            }

            .score-value {
                font-size: 24px;
                font-weight: bold;
                color: ${primaryColor};
            }

            .section {
                margin-bottom: 30px;
            }

            .section-title {
                font-family: 'Space+Grotesk', sans-serif;
                font-size: 18px;
                font-weight: bold;
                border-left: 4px solid ${primaryColor};
                padding-left: 10px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
            }

            .question {
                font-weight: 600;
                color: ${darkBg};
                margin-bottom: 8px;
            }

            .answer {
                font-size: 14px;
                color: #475569;
            }

            .gap-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
            }

            .severity {
                font-weight: bold;
                text-transform: uppercase;
                font-size: 10px;
            }

            .high { color: #ef4444; }
            .medium { color: #f59e0b; }
            .low { color: #10b981; }

            .transcript-item {
                margin-bottom: 20px;
                padding-left: 15px;
                border-left: 2px solid #e2e8f0;
            }

            .bot-label { color: ${primaryColor}; font-weight: bold; font-size: 12px; }
            .user-label { color: ${secondaryColor}; font-weight: bold; font-size: 12px; }

            footer {
                margin-top: 50px;
                text-align: center;
                font-size: 10px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title-section">
                <span>HireStack AI Report</span>
                <h1>${title || (type === 'mock' ? 'Mock Interview Results' : 'Interview Readiness Analysis')}</h1>
                <p>${type === 'mock' ? `Role: ${role || 'N/A'} | Difficulty: ${difficulty || 'N/A'}` : 'Comprehensive Skill & Resume Analysis'}</p>
            </div>
            <div class="score-badge">
                <div class="score-value">${matchScore || (score?.overall ? score.overall * 10 : 0)}%</div>
                <div style="font-size: 10px; opacity: 0.8;">Readiness Score</div>
            </div>
        </div>

        ${behaviorMetrics ? `
        <div class="section">
            <div class="section-title">Neural Vision Metrics</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="card">
                    <strong>Average Confidence:</strong> ${behaviorMetrics.averageConfidence}%<br/>
                    <strong>Dominant Emotion:</strong> ${behaviorMetrics.dominantEmotion}
                </div>
                <div class="card">
                    <strong>Face Presence:</strong> ${behaviorMetrics.faceMissingDuration === 0 ? 'Optimal' : `${behaviorMetrics.faceMissingDuration}s missing`}<br/>
                    <strong>Behavioral Stability:</strong> ${behaviorMetrics.faceMissingCount === 0 ? 'High' : 'Frequent movement'}
                </div>
            </div>
        </div>
        ` : ''}

        ${technicalQuestions.length > 0 ? `
        <div class="section">
            <div class="section-title">Technical Interview Questions</div>
            ${technicalQuestions.map((q, i) => `
                <div class="card">
                    <div class="question">${i+1}. ${q.question}</div>
                    <div class="answer"><strong>Recruiters goal:</strong> ${q.intention}</div>
                    <div class="answer" style="margin-top: 5px;"><strong>Best Approach:</strong> ${q.answer}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${qaHistory.length > 0 ? `
        <div class="section">
            <div class="section-title">Interview Transcript</div>
            ${qaHistory.map((qa, i) => `
                <div class="transcript-item">
                    <div class="bot-label">INTERVIEWER:</div>
                    <div style="font-size: 14px; margin-bottom: 5px;">${qa.question}</div>
                    ${qa.answer ? `
                        <div class="user-label">CANDIDATE:</div>
                        <div style="font-size: 14px; font-style: italic;">"${qa.answer}"</div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${skillGaps.length > 0 ? `
        <div class="section">
            <div class="section-title">Identified Skill Gaps</div>
            <div class="card">
                ${skillGaps.map(g => `
                    <div class="gap-item">
                        <span>${g.skill}</span>
                        <span class="severity ${g.severity}">${g.severity}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${preparationPlan.length > 0 ? `
        <div class="section">
            <div class="section-title">7-Day Preparation Plan</div>
            ${preparationPlan.slice(0, 7).map(d => `
                <div class="card">
                    <strong>Day ${d.day}: ${d.focus}</strong>
                    <ul style="font-size: 13px; margin-top: 5px; color: #475569;">
                        ${(d.tasks || []).map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <footer>
            Generated by HireStack AI | Intelligent Interview Preparation Platform<br/>
            &copy; ${new Date().getFullYear()} HireStack. All rights reserved.
        </footer>
    </body>
    </html>
  `;
};
