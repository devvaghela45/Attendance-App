import { Router } from 'express';
import { AttendanceStatus } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

router.post('/mark-daily', requireAuth, requireRole('EMPLOYER'), async (req: AuthenticatedRequest, res) => {
  const { date, absentEmployeeIds } = req.body as { date: string; absentEmployeeIds: string[] };
  const companyId = req.user!.companyId!;

  const employees = await prisma.employees.findMany({ where: { companyId, approvalStatus: true }, select: { id: true } });
  const attendanceDate = new Date(date);

  const payload = employees.map((employee) => ({
    companyId,
    employeeId: employee.id,
    date: attendanceDate,
    status: absentEmployeeIds.includes(employee.id) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
    markedByUserId: req.user!.userId
  }));

  await prisma.attendance.createMany({ data: payload, skipDuplicates: true });
  res.json({ message: 'Attendance saved', count: payload.length });
});

export default router;
