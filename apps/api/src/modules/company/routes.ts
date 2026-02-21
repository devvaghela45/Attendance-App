import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../../middleware/auth.js';
import { generateCompanyCode, generateInviteToken, generateJoinCode } from '../../utils/code.js';

const router = Router();

const companySchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  gstNumber: z.string().optional()
});

router.post('/', requireAuth, requireRole('EMPLOYER'), async (req: AuthenticatedRequest, res) => {
  const payload = companySchema.parse(req.body);
  const ownerId = req.user!.userId;

  const company = await prisma.companies.create({
    data: {
      ...payload,
      ownerId,
      companyCode: generateCompanyCode(),
      joiningCode: generateJoinCode(),
      inviteToken: generateInviteToken()
    }
  });

  await prisma.users.update({ where: { id: ownerId }, data: { companyId: company.id } });

  return res.status(201).json({
    company,
    inviteLink: `${req.protocol}://${req.get('host')}/employee/join/${company.inviteToken}`
  });
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const company = await prisma.companies.findFirst({ where: { id: req.user?.companyId ?? undefined } });
  res.json({ company });
});

export default router;
