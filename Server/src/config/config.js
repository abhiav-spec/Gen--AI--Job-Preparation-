import dotenv from 'dotenv';
import path from 'path';
import { exit } from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;
const groqApiKey = process.env.GROQ_API_KEY;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const nodeEnv = process.env.NODE_ENV || 'development';
const corsOrigins = (process.env.CORS_ORIGINS || '')
	.split(',')
	.map((o) => o.trim())
	.filter(Boolean);

if (!mongoUri) {
	console.error('Missing MONGODB_URI (or MONGO_URI) in environment variables');
	exit(1);
}

if (!jwtSecret) {
	console.error('Missing JWT_SECRET in environment variables');
	exit(1);
}

const config = {
	PORT: port,
	MONGODB_URI: mongoUri,
	JWT_SECRET: jwtSecret,
	GROQ_API_KEY: groqApiKey,
	CLIENT_URL: clientUrl,
	CORS_ORIGINS: corsOrigins,
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
	GOOGLE_USER: process.env.GOOGLE_USER,
	NODE_ENV: nodeEnv,
	COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',
	COOKIE_SECURE: process.env.COOKIE_SECURE === 'true', // Default to false for HTTP testing
};

if (nodeEnv !== 'production') {
	console.log('--- Env Loader ---');
	console.log('NODE_ENV:', nodeEnv);
	console.log('CLIENT_URL:', clientUrl);
	console.log('GMAIL_PASS loaded:', !!process.env.GMAIL_PASS);
	console.log('GOOGLE_USER loaded:', !!process.env.GOOGLE_USER);
}

export default config;
