import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';

const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  mobile: z.string().min(10),
  password: z.string().min(6),
  role: z.enum(['EMPLOYER', 'EMPLOYEE'])
});

const router = Router();

router.post('/signup', async (req, res) => {
  const payload = signupSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(payload.password, 10);

  const user = await prisma.users.create({ data: { ...payload, passwordHash } });
  return res.status(201).json({ userId: user.id, message: 'Registered. Verify OTP to activate account.' });
});

router.post('/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body as { mobile: string; otp: string };
  if (!otp) return res.status(400).json({ message: 'OTP required' });

  const user = await prisma.users.update({ where: { mobile }, data: { otpVerified: true } });
  return res.json({ message: 'OTP verified', userId: user.id });
});

router.post('/login', async (req, res) => {
  const { mobile, password } = req.body as { mobile: string; password: string };
  const user = await prisma.users.findUnique({ where: { mobile } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role, companyId: user.companyId ?? undefined, employeeId: user.employeeId ?? undefined }, env.jwtSecret, {
    expiresIn: '1d'
  });

  return res.json({ token, role: user.role, userId: user.id });
});

export default router;
