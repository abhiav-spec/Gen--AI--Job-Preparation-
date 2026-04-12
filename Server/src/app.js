import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { generateInterviewReport } from './services/ai.service.js';
import interviewRouter from './routes/interview.routes.js';
import mockInterviewRouter from './routes/mockInterview.routes.js';
import notificationRouter from './routes/notification.routes.js';
import config from './config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');


const app = express();
app.set('trust proxy', 1);

const allowedOrigins = [
    config.CLIENT_URL,
    ...(config.CORS_ORIGINS || []),
    `http://localhost:${config.PORT}`,
    `http://127.0.0.1:${config.PORT}`,
    'http://localhost:4000',
    'http://127.0.0.1:4000',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5174',
    'http://localhost:5174',
    'http://43.205.126.119',
    'http://43.205.126.119:80',
].filter(Boolean);

if (!config.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is missing from environment variables!');
}

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https://ui-avatars.com'],
                connectSrc: ["'self'", 'https://cdn.jsdelivr.net'],
                mediaSrc: ["'self'", 'blob:'],
                upgradeInsecureRequests: null,
            },
        },
        hsts: false,
    })
);

app.use(express.static(publicDir));
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.NODE_ENV === 'production' ? 250 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        environment: config.NODE_ENV,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRouter);
app.use('/api/mock-interview', mockInterviewRouter);
app.use('/api/notifications', notificationRouter);

app.post('/api/generate-interview-report', async (req, res) => {
    try {
        const { resume, selfdescription, jobdescription } = req.body;
        
        if (!resume || !selfdescription || !jobdescription) {
            return res.status(400).json({ 
                error: 'Missing required fields: resume, selfdescription, jobdescription' 
            });
        }
        
        const report = await generateInterviewReport({
            resume,
            selfdescription,
            jobdescription
        });
        
        res.json({ success: true, data: report });
    } catch (error) {
        console.error('Error generating interview report:', error);
        res.status(500).json({ 
            error: 'Failed to generate interview report',
            message: error.message 
        });
    }
});

app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'HireStack API is running',
        health: '/api/health',
    });
});

// SPA fallback: serve React app for all non-API GET requests
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});


app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: 'Internal server error' });
});

export default app;