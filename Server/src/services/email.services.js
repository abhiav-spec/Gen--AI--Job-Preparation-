import nodemailer from 'nodemailer';
import config from '../config/config.js';

const sendEmail = async (to, subject, text, html) => {
    try {
        let transporter;
        
        if (!config.GOOGLE_USER) {
            return {
                success: false,
                error: 'Missing GOOGLE_USER in environment variables',
            };
        }

        // Use App Password if available (much more stable)
        if (process.env.GMAIL_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.GOOGLE_USER,
                    pass: process.env.GMAIL_PASS, // App Password from Google
                },
            });
        } else if (config.GOOGLE_CLIENT_ID && config.GOOGLE_REFRESH_TOKEN) {
            // Fallback to OAuth2
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: config.GOOGLE_USER,
                    clientId: config.GOOGLE_CLIENT_ID,
                    clientSecret: config.GOOGLE_CLIENT_SECRET,
                    refreshToken: config.GOOGLE_REFRESH_TOKEN,
                },
            });
        } else {
            return {
                success: false,
                error: 'Missing Email Configuration (GMAIL_PASS or GOOGLE_OAUTH keys)',
            };
        }

        await transporter.sendMail({
            from: config.GOOGLE_USER,
            to,
            subject,
            text,
            html,
        });

        return { success: true };
    } catch (error) {
        console.error('📧 [EmailService] Detailed Error:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            command: error.command
        });
        return {
            success: false,
            error: error.message,
        };
    }
};

export default sendEmail;
