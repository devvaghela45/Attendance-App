import { Router } from 'express';
import { prisma } from '../../config/db.js';
import { requireAuth, type AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

router.get('/attendance-summary', requireAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.user?.companyId;
  const employeeId = (req.query.employeeId as string | undefined) ?? (req.user?.role === 'EMPLOYEE' ? req.user.employeeId : undefined);
  const from = new Date(String(req.query.from));
  const to = new Date(String(req.query.to));

  const attendance = await prisma.attendance.findMany({
    where: {
      companyId,
      employeeId,
      date: { gte: from, lte: to }
    }
  });

  const overtime = await prisma.overtime.findMany({ where: { companyId, employeeId, date: { gte: from, lte: to } } });

  const present = attendance.filter((a) => a.status === 'PRESENT').length;
  const absent = attendance.filter((a) => a.status === 'ABSENT').length;
  const total = present + absent;
  const overtimeHours = overtime.reduce((sum, item) => sum + Number(item.hours), 0);

  res.json({
    presentDays: present,
    absentDays: absent,
    overtimeHours,
    attendancePercentage: total === 0 ? 0 : Number(((present / total) * 100).toFixed(2))
  });
});

router.get('/export/csv', requireAuth, async (req: AuthenticatedRequest, res) => {
  const from = new Date(String(req.query.from));
  const to = new Date(String(req.query.to));

  const records = await prisma.attendance.findMany({
    where: { companyId: req.user?.companyId, date: { gte: from, lte: to } },
    include: { employee: true }
  });

  const csv = ['Date,Employee,Status'];
  records.forEach((r) => csv.push(`${r.date.toISOString().slice(0, 10)},${r.employee.fullName},${r.status}`));

  res.setHeader('Content-Type', 'text/csv');
  res.send(csv.join('\n'));
});

export default router;
