# Scalable Architecture Plan

## Backend modules

- `auth`: signup/login, OTP verification, JWT sessions.
- `company`: create company, auto-generate company code, invite token, join code.
- `employee`: manual add, invite join workflow, employer approval.
- `attendance`: default-present + absent-list daily marking.
- `overtime`: overtime entries allowed only for present employees.
- `reports`: summary by date range, employee or all, export adapters.
- `dashboard`: role-based KPI aggregation.

## Security model

- Role-based route middleware (`EMPLOYER`, `EMPLOYEE`).
- Field-level encryption for UAN / bank / IFSC.
- OTP hook endpoint for mobile verification integration.
- JWT token for stateless scaling across instances.

## Data relationships

- One company to many employees.
- One employee to many attendance records.
- One employee to many overtime records.
- One user can own one company (employer owner).

## Extension points

- Salary, leave, payroll, and multi-branch can be added as new modules with foreign keys to `Companies` and `Employees`.
