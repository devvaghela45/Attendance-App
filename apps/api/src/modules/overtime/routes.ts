import { Router } from 'express';
import { prisma } from '../../config/db.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('EMPLOYER'), async (req: AuthenticatedRequest, res) => {
  const { date, entries } = req.body as { date: string; entries: Array<{ employeeId: string; hours: number }> };
  const companyId = req.user!.companyId!;

  const presentToday = await prisma.attendance.findMany({
    where: { companyId, date: new Date(date), status: 'PRESENT' },
    select: { employeeId: true }
  });

  const presentSet = new Set(presentToday.map((p) => p.employeeId));
  const validEntries = entries.filter((e) => presentSet.has(e.employeeId)).map((e) => ({
    companyId,
    employeeId: e.employeeId,
    date: new Date(date),
    hours: e.hours,
    createdByUserId: req.user!.userId
  }));

  await prisma.overtime.createMany({ data: validEntries, skipDuplicates: true });
  res.json({ message: 'Overtime saved', count: validEntries.length });
});

export default router;
