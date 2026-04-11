import dotenv from 'dotenv';
import path from 'path';
import { exit } from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

console.log('--- Env Loader ---');
console.log('GMAIL_PASS loaded:', !!process.env.GMAIL_PASS);
console.log('GOOGLE_USER:', process.env.GOOGLE_USER);

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;
const groqApiKey = process.env.GROQ_API_KEY;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

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
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
	GOOGLE_USER: process.env.GOOGLE_USER,
	NODE_ENV: process.env.NODE_ENV || 'development',
};

export default config;
