import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { extractApiErrorMessage } from '../../services/api';

const DEPARTMENT_OPTIONS = ['Engineering', 'Finance', 'HR', 'Operations', 'Sales'];
const STATUS_OPTIONS = ['Active', 'Inactive'];

function useDebouncedValue(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

export default function EmployeeDirectory() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoading(true);
      setPageError('');

      try {
        const response = await api.get('/api/employees', {
          params: {
            search: debouncedSearch.trim() || undefined,
            department: department || undefined,
            status: status || undefined,
          },
        });

        const payload = response?.data?.data ?? [];
        setEmployees(Array.isArray(payload) ? payload : []);
      } catch (error) {
        setEmployees([]);
        setPageError(extractApiErrorMessage(error, 'Failed to load employees.'));
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, [debouncedSearch, department, status]);

  const titleSuffix = useMemo(() => {
    const filters = [department, status].filter(Boolean);
    return filters.length ? ` · ${filters.join(' · ')}` : '';
  }, [department, status]);

  const getBadgeClassName = (employeeStatus) =>
    employeeStatus === 'Active'
      ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
      : 'bg-slate-700 text-slate-300 ring-1 ring-slate-600';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Employee Directory{titleSuffix}</h1>
            <p className="mt-1 text-sm text-slate-400">Search, review, and manage employee records.</p>
          </div>

          <button
            className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
            onClick={() => navigate('/employees/new')}
            type="button"
          >
            Register Employee
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-black/10">
          <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr]">
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by employee name or NIC"
              value={search}
            />

            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              onChange={(event) => setDepartment(event.target.value)}
              value={department}
            >
              <option value="">All departments</option>
              {DEPARTMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {pageError ? (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {pageError}
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-800/80 text-left text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    {['Employee ID', 'Full Name', 'NIC', 'Department', 'Branch', 'Status'].map((label) => (
                      <th key={label} className="px-5 py-4 font-medium">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 bg-slate-900">
                  {isLoading ? (
                    <tr>
                      <td className="px-5 py-16 text-center text-slate-400" colSpan={6}>
                        Loading employees...
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td className="px-5 py-16 text-center text-slate-400" colSpan={6}>
                        No employees found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr
                        className="cursor-pointer transition hover:bg-slate-800/60"
                        key={employee.id}
                        onClick={() => navigate(`/employees/${employee.id}`)}
                      >
                        <td className="px-5 py-4 font-mono text-xs uppercase tracking-wide text-slate-400">
                          {String(employee.id || '').slice(0, 8)}
                        </td>
                        <td className="px-5 py-4 font-medium text-white">{employee.full_name || '—'}</td>
                        <td className="px-5 py-4 text-slate-300">{employee.nic || '—'}</td>
                        <td className="px-5 py-4 text-slate-300">{employee.department || '—'}</td>
                        <td className="px-5 py-4 text-slate-400">{employee.branch || '—'}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getBadgeClassName(
                              employee.status,
                            )}`}
                          >
                            {employee.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
