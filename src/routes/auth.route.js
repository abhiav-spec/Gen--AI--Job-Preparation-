import { Router } from 'express';
import {
    registerUser,
    login,
    verifyEmail,
    resendOtp,
    refreshToken,
    getUserProfile,
    logout,
    logoutAll,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.get('/profile', getUserProfile);

export default router;
