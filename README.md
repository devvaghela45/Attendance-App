# Attendance Management App (Mobile + Web)

A scalable, mobile-first attendance platform for **Employers** and **Employees**.

## What is included

- **Scalable backend architecture** using layered modules (auth, company, employee, attendance, overtime, reports).
- **Secure database design** with Prisma models and relational integrity.
- **Role-based access control** for Employer/Admin and Employee.
- **OTP-ready authentication hooks** and JWT session pattern.
- **Sensitive data encryption service** for UAN, bank account number, and IFSC.
- **Mobile-first web UI** with dashboards for both roles.
- **Dark/light mode** and clean professional layout.
- **CSV export endpoints now**, with PDF/Excel adapter stubs for extension.

## Project structure

```
apps/
  api/             # Node + Express + Prisma backend
  web/             # React + TypeScript mobile-first frontend
```

## Core feature coverage

### User roles
- Employer (Admin): create company, add/approve employees, mark attendance, add overtime, generate reports.
- Employee: join via invite link/code, view attendance/overtime, download personal report.

### Company & invite flow
- Employer signup and company creation.
- Auto-generated company code and invite token/link.
- Employee joins via invite flow and waits for employer approval.

### Attendance & overtime
- End-of-day attendance marking where absent list is submitted and others default to present.
- Overtime entry restricted to present employees.

### Reports
- Date range report by employee/all employees.
- Returns present, absent, overtime, attendance percentage.
- Export hooks for PDF/Excel.

### Security
- JWT auth + role checks.
- Field-level encryption for sensitive employee data.
- OTP placeholders for provider integration.

## Future scalability
Current architecture keeps modules decoupled and adds clear extension points for:
- Salary calculation
- Leave management
- Payroll export
- Multi-branch companies

## Quick start (after installing dependencies)

```bash
# API
cd apps/api
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev

# Web
cd ../web
npm install
npm run dev
```

