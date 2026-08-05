import { Router } from 'express';
import { sendOtp, verifyOtp } from '../controllers/auth.controllers.js';

const router = Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Generate and send 6-digit OTP to user's phone number
 * @access  Public
 */
router.post('/send-otp', sendOtp);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP code and return JWT authentication token + User details
 * @access  Public
 */
router.post('/verify-otp', verifyOtp);

export default router;