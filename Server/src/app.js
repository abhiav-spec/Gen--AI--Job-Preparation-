import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { generateInterviewReport } from './services/ai.service.js';
const  interviewRouter = require('./routes/interview.routes.js');


const app = express();

const allowedOrigins = [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5174',
    'http://localhost:5174',
    'http://127.0.0.1:5175',
    'http://localhost:5175',
    'http://127.0.0.1:5176',
    'http://localhost:5176',
    'http://127.0.0.1:5177',
    'http://localhost:5177',
];

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

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRouter);

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

app.get('/', (req, res) => {
    res.send('Welcome to the Authentication System API');
});


export default app;