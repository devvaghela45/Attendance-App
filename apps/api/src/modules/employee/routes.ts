import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../../middleware/auth.js';
import { encryptText } from '../../utils/crypto.js';

const router = Router();

const employeeSchema = z.object({
  fullName: z.string().min(2),
  mobile: z.string().min(10),
  dateOfBirth: z.string(),
  uanNumber: z.string().min(6),
  bankAccountNumber: z.string().min(6),
  ifscCode: z.string().min(6),
  email: z.string().email().optional()
});

router.post('/manual', requireAuth, requireRole('EMPLOYER'), async (req: AuthenticatedRequest, res) => {
  const payload = employeeSchema.parse(req.body);
  const employee = await prisma.employees.create({
    data: {
      companyId: req.user!.companyId!,
      fullName: payload.fullName,
      mobile: payload.mobile,
      dateOfBirth: new Date(payload.dateOfBirth),
      encryptedUanNumber: encryptText(payload.uanNumber),
      encryptedBankAccount: encryptText(payload.bankAccountNumber),
      encryptedIfscCode: encryptText(payload.ifscCode),
      email: payload.email,
      createdByEmployerId: req.user!.userId,
      approvalStatus: true
    }
  });
  res.status(201).json({ employee });
});

router.post('/join/:inviteToken', async (req, res) => {
  const payload = employeeSchema.parse(req.body);
  const company = await prisma.companies.findUnique({ where: { inviteToken: req.params.inviteToken } });
  if (!company) return res.status(404).json({ message: 'Invalid invite token' });

  const employee = await prisma.employees.create({
    data: {
      companyId: company.id,
      fullName: payload.fullName,
      mobile: payload.mobile,
      dateOfBirth: new Date(payload.dateOfBirth),
      encryptedUanNumber: encryptText(payload.uanNumber),
      encryptedBankAccount: encryptText(payload.bankAccountNumber),
      encryptedIfscCode: encryptText(payload.ifscCode),
      email: payload.email,
      createdByEmployerId: company.ownerId,
      approvalStatus: false
    }
  });
  res.status(201).json({ message: 'Request submitted. Waiting employer approval.', employeeId: employee.id });
});

router.patch('/:employeeId/approve', requireAuth, requireRole('EMPLOYER'), async (req: AuthenticatedRequest, res) => {
  const result = await prisma.employees.updateMany({
    where: { id: req.params.employeeId, companyId: req.user!.companyId! },
    data: { approvalStatus: true }
  });
  if (!result.count) return res.status(404).json({ message: 'Employee not found' });
  const employee = await prisma.employees.findUnique({ where: { id: req.params.employeeId } });
  res.json({ employee });
});

router.get('/my-profile', requireAuth, requireRole('EMPLOYEE'), async (req: AuthenticatedRequest, res) => {
  const user = await prisma.users.findUnique({ where: { id: req.user!.userId }, include: { employeeProfile: true } });
  res.json({ profile: user?.employeeProfile });
});

export default router;
