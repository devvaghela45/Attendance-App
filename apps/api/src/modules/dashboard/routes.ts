import { Router } from 'express';
import { prisma } from '../../config/db.js';
import { requireAuth, type AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.user?.companyId;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  if (req.user?.role === 'EMPLOYER') {
    const [totalEmployees, todayAttendance, overtimeToday] = await Promise.all([
      prisma.employees.count({ where: { companyId, approvalStatus: true } }),
      prisma.attendance.findMany({ where: { companyId, date: { gte: start, lt: end } } }),
      prisma.overtime.aggregate({ where: { companyId, date: { gte: start, lt: end } }, _sum: { hours: true } })
    ]);

    const present = todayAttendance.filter((a) => a.status === 'PRESENT').length;
    const absent = todayAttendance.filter((a) => a.status === 'ABSENT').length;

    return res.json({
      totalEmployees,
      todayPresentCount: present,
      todayAbsentCount: absent,
      totalOvertimeToday: Number(overtimeToday._sum.hours ?? 0)
    });
  }

  const [attendance, overtime] = await Promise.all([
    prisma.attendance.findMany({ where: { employeeId: req.user?.employeeId, date: { gte: start, lt: end } } }),
    prisma.overtime.aggregate({ where: { employeeId: req.user?.employeeId, date: { gte: start, lt: end } }, _sum: { hours: true } })
  ]);

  const presentDays = attendance.filter((a) => a.status === 'PRESENT').length;
  const absentDays = attendance.filter((a) => a.status === 'ABSENT').length;
  const total = presentDays + absentDays;

  return res.json({
    thisMonthPresentDays: presentDays,
    thisMonthAbsentDays: absentDays,
    totalOvertime: Number(overtime._sum.hours ?? 0),
    attendancePercentage: total === 0 ? 0 : Number(((presentDays / total) * 100).toFixed(2))
  });
});

export default router;
