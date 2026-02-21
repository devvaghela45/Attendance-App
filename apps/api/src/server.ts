import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './modules/auth/routes.js';
import companyRoutes from './modules/company/routes.js';
import employeeRoutes from './modules/employee/routes.js';
import attendanceRoutes from './modules/attendance/routes.js';
import overtimeRoutes from './modules/overtime/routes.js';
import reportRoutes from './modules/reports/routes.js';
import dashboardRoutes from './modules/dashboard/routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/companies', companyRoutes);
app.use('/employees', employeeRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/overtime', overtimeRoutes);
app.use('/reports', reportRoutes);
app.use('/dashboard', dashboardRoutes);

app.listen(env.port, () => {
  console.log(`API running on port ${env.port}`);
});
