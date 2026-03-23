import User from '../models/user.model.js';
import Session from '../models/session.model.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import sendEmail from '../services/email.services.js';
import { generateOTP, getOtpHtml } from '../utils/otp.util.js';
import Otp from '../models/otp.model.js';

 const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const user = await User.create({ username, email, password: hashedPassword });

        const refreshtoken=jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('refreshToken', refreshtoken, { 
            httpOnly: true,
            secure:true,
            sameSite:'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 

        });

        const refreshtokenhash = crypto.createHash('sha256').update(refreshtoken).digest('hex');
        const session = await Session.create({
            user: user._id,
            refreshToken: refreshtokenhash,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        const accesstoken = jwt.sign({
            id: user._id, session_id: session._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        const otp = generateOTP();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        // Remove any existing OTPs for this email before creating a new one
        await Otp.deleteMany({ email });
        await Otp.create({ email, otpHash });

        // Send OTP email
        const emailResult = await sendEmail(user.email, 'Verify your email', `Your OTP is ${otp}`, getOtpHtml(otp));
        
        // Log OTP to console for development (remove in production)
        console.log(`📧 OTP for ${email}: ${otp}`);
        
        if (!emailResult.success) {
            console.warn(`⚠️ Email sending failed: ${emailResult.error}. OTP available in console logs.`);
        }

        const responsePayload = {
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified,
                acesstoken: accesstoken,
            },
        };

        // Development fallback: allow verification flow even if SMTP/OAuth is misconfigured.
        if (!emailResult.success && process.env.NODE_ENV !== 'production') {
            responsePayload.otpSent = false;
            responsePayload.devOtp = otp;
            responsePayload.emailError = emailResult.error;
        } else {
            responsePayload.otpSent = true;
        }

        return res.status(201).json(responsePayload);

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getUserProfile = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const session = await Session.findOne({ 
            refreshToken: refreshTokenHash ,
                revoked: false
        });
        if(!session){
            return res.status(400).json({ error: 'Session not found' });
        }   
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
        session.refreshToken = newRefreshTokenHash;
        await session.save();
        res.cookie('refreshToken', newRefreshToken, { 
            httpOnly: true,
            secure:true,
            sameSite:'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({ accessToken });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token not found' });
    }

   try{
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await Session.findOne({ refreshToken: refreshTokenHash });
    if(!session){
        return res.status(400).json({ error: 'Session not found' });
    }

    session.revoked = true;
    await session.save();
    
    res.clearCookie('refreshToken', { 
        httpOnly: true,
        secure:true,
        sameSite:'strict',
    });
    res.status(200).json({ message: 'Logout successful' });

   }catch(error){
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Internal server error' });
   }
}


const logoutAll = async (req, res) => {
 const refreshToken = req.cookies.refreshToken;
 if (!refreshToken) {
     return res.status(400).json({ error: 'Refresh token not found' });
 } try{
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const userId = decoded.id;
    await Session.updateMany({ user: userId }, { revoked: true });
    res.clearCookie('refreshToken', { 
        httpOnly: true,
        secure:true,
        sameSite:'strict',
    });
    res.status(200).json({ message: 'Logged out from all sessions successfully' });
 }
 catch(error){
    console.error('Error logging out from all sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
 }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        if(!user.verified){
            return res.status(400).json({ error: 'Email not verified' });
        }

        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        if (hashedPassword !== user.password) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const refreshtoken=jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('refreshToken', refreshtoken, { 
            httpOnly: true,
            secure:true,
            sameSite:'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000

        });

        const refreshtokenhash = crypto.createHash('sha256').update(refreshtoken).digest('hex');
        const session = await Session.create({
            user: user._id,
            refreshToken: refreshtokenhash,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        const accesstoken = jwt.sign({ 
            id: user._id ,session_id:session._id}, process.env.JWT_SECRET, { expiresIn: '15m' });

        return res.status(200).json({ 
        message: 'Login successful' ,
        user:{
            id: user._id,
            username: user.username,
            email: user.email,
            acesstoken: accesstoken
        }
    });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }
        if (!/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({ error: 'OTP must be 6 digits' });
        }

        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const otpRecord = await Otp.findOne({ email, otpHash });
        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        const users = await User.findByIdAndUpdate(user._id, { verified: true }, { new: true });
        await Otp.deleteOne({ email, otpHash });
        return res.status(200).json({
            message: 'Email verified successfully',
            user:{
                id: users._id,
                username: users.username,
                email: users.email,
                verified: users.verified,
            }
        });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        if (user.verified) {
            return res.status(400).json({ error: 'Email is already verified' });
        }

        const otp = generateOTP();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        await Otp.deleteMany({ email });
        await Otp.create({ email, otpHash });

        const emailResult = await sendEmail(user.email, 'Verify your email', `Your OTP is ${otp}`, getOtpHtml(otp));
        console.log(`📧 Resent OTP for ${email}: ${otp}`);

        return res.status(200).json({
            message: 'OTP resent successfully',
            otpSent: emailResult.success,
            ...(process.env.NODE_ENV !== 'production' && !emailResult.success ? { devOtp: otp } : {}),
        });
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export { registerUser, getUserProfile, refreshToken, logout, logoutAll, login, verifyEmail, resendOtp };