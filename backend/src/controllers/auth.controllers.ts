import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

// Simple in-memory OTP store for local development testing
const otpStore = new Map<string, string>();

export async function sendOtp(req: Request, res: Response) {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Default test OTP
    const otp = '123456';
    otpStore.set(phone, otp);

    console.log(`\n========================================`);
    console.log(`[DEV SERVER OTP LOG]`);
    console.log(`Phone: ${phone}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`========================================\n`);

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const cachedOtp = otpStore.get(phone);
    if (!cachedOtp || cachedOtp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Find user in Neon DB or create a new record
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: 'New User',
        },
      });
    }

    // Clear used OTP
    otpStore.delete(phone);

    // Issue JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'agricontact_secret_key_2026';
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Authentication successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}