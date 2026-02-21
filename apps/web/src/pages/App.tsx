import { useMemo, useState } from 'react';

export const App = () => {
  const [role, setRole] = useState<'EMPLOYER' | 'EMPLOYEE'>('EMPLOYER');
  const [dark, setDark] = useState(false);

  const stats = useMemo(() => {
    if (role === 'EMPLOYER') {
      return [
        ['Total Employees', '42'],
        ['Today Present', '36'],
        ['Today Absent', '6'],
        ['Overtime Today', '19.5 hrs']
      ];
    }

    return [
      ['This Month Present', '20'],
      ['This Month Absent', '2'],
      ['Total Overtime', '12.5 hrs'],
      ['Attendance %', '90.9%']
    ];
  }, [role]);

  return (
    <main className={dark ? 'app dark' : 'app'}>
      <header>
        <h1>Attendance Management</h1>
        <div className="header-actions">
          <button onClick={() => setRole(role === 'EMPLOYER' ? 'EMPLOYEE' : 'EMPLOYER')}>{role}</button>
          <button onClick={() => setDark((v) => !v)}>{dark ? 'Light' : 'Dark'} Mode</button>
        </div>
      </header>

      <section className="cards">
        {stats.map(([label, value]) => (
          <article key={label} className="card">
            <p>{label}</p>
            <h3>{value}</h3>
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>{role === 'EMPLOYER' ? 'Admin Actions' : 'Employee Actions'}</h2>
        {role === 'EMPLOYER' ? (
          <ul>
            <li>Create company and share invite link/code</li>
            <li>Add/approve employees</li>
            <li>Mark daily attendance and overtime</li>
            <li>Generate/export reports (PDF/Excel)</li>
          </ul>
        ) : (
          <ul>
            <li>Join company via invite link/code</li>
            <li>View attendance and overtime details</li>
            <li>Download personal attendance report</li>
          </ul>
        )}
      </section>
    </main>
  );
};
