import nodemailer from 'nodemailer';
import config from '../config/config.js';

const sendEmail = async (to, subject, text, html) => {
    try {
        if (!config.GOOGLE_USER || !config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET || !config.GOOGLE_REFRESH_TOKEN) {
            return {
                success: false,
                error: 'Missing Google OAuth email configuration',
            };
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: config.GOOGLE_USER,
                clientId: config.GOOGLE_CLIENT_ID,
                clientSecret: config.GOOGLE_CLIENT_SECRET,
                refreshToken: config.GOOGLE_REFRESH_TOKEN,
            },
        });

        await transporter.sendMail({
            from: config.GOOGLE_USER,
            to,
            subject,
            text,
            html,
        });

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

export default sendEmail;
