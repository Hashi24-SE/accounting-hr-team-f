import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { extractApiErrorMessage } from '../../services/api';

const initialSalaryForm = {
  basic_salary: '',
  hourly_ot_rate: '',
  effective_date: '',
};

const currency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '—';
  return `LKR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const dateValue = (value) => value || '—';

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [pageError, setPageError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [salaryForm, setSalaryForm] = useState(initialSalaryForm);
  const [salaryErrors, setSalaryErrors] = useState({});
  const [isSavingSalary, setIsSavingSalary] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const activeSalary = useMemo(
    () => salaryHistory.find((item) => !item.end_date) || null,
    [salaryHistory],
  );

  const loadData = async () => {
    setIsLoading(true);
    setPageError('');
    setNotFound(false);

    try {
      const [employeeResponse, salaryResponse] = await Promise.all([
        api.get(`/api/employees/${id}`),
        api.get(`/api/employees/${id}/salary`),
      ]);

      setEmployee(employeeResponse?.data?.data ?? null);
      const salaryPayload = salaryResponse?.data?.data ?? [];
      setSalaryHistory(Array.isArray(salaryPayload) ? salaryPayload : []);
    } catch (error) {
      if (error?.response?.status === 404) {
        setNotFound(true);
      } else {
        setPageError(extractApiErrorMessage(error, 'Failed to load employee profile.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const updateSalaryField = (field) => (event) => {
    const value = event.target.value;
    setSalaryForm((previous) => ({ ...previous, [field]: value }));
    setSalaryErrors((previous) => ({ ...previous, [field]: '' }));
  };

  const validateSalaryForm = () => {
    const nextErrors = {};

    if (!salaryForm.basic_salary || Number(salaryForm.basic_salary) <= 0) {
      nextErrors.basic_salary = 'Basic salary must be a positive value.';
    }

    if (!salaryForm.hourly_ot_rate || Number(salaryForm.hourly_ot_rate) <= 0) {
      nextErrors.hourly_ot_rate = 'Hourly OT rate must be a positive value.';
    }

    if (!salaryForm.effective_date) {
      nextErrors.effective_date = 'Effective date is required.';
    }

    return nextErrors;
  };

  const handleSalarySubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateSalaryForm();
    setSalaryErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSavingSalary(true);

    try {
      await api.post(`/api/employees/${id}/salary`, {
        basic_salary: Number(salaryForm.basic_salary),
        hourly_ot_rate: Number(salaryForm.hourly_ot_rate),
        effective_date: salaryForm.effective_date,
      });

      setShowSalaryModal(false);
      setSalaryForm(initialSalaryForm);
      setSuccessMessage('Salary revision saved successfully.');
      await loadData();
    } catch (error) {
      setPageError(extractApiErrorMessage(error, 'Failed to revise salary.'));
    } finally {
      setIsSavingSalary(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);

    try {
      await api.patch(`/api/employees/${id}/status`);
      navigate('/employees', {
        replace: true,
        state: { successMessage: 'Employee deactivated successfully.' },
      });
    } catch (error) {
      setPageError(extractApiErrorMessage(error, 'Failed to deactivate employee.'));
    } finally {
      setIsDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  const renderMeta = (label, value) => (
    <div key={label}>
      <dt className="text-xs uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-white">{value || '—'}</dd>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading employee profile...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Employee not found</h1>
          <p className="mt-3 text-sm text-slate-400">
            The requested employee profile could not be found.
          </p>
          <button
            className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
            onClick={() => navigate('/employees')}
            type="button"
          >
            Back to directory
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Unable to display employee details.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button
              className="mb-4 text-sm text-slate-400 transition hover:text-white"
              onClick={() => navigate('/employees')}
              type="button"
            >
              ← Back to directory
            </button>
            <h1 className="text-2xl font-bold tracking-tight">{employee.full_name}</h1>
            <p className="mt-2 text-sm text-slate-400">
              {employee.designation || '—'} · {employee.department || '—'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {employee.status === 'Active' ? (
              <>
                <button
                  className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
                  onClick={() => setShowSalaryModal(true)}
                  type="button"
                >
                  Revise Salary
                </button>
                <button
                  className="rounded-xl border border-red-500/40 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
                  onClick={() => setShowDeactivateModal(true)}
                  type="button"
                >
                  Deactivate Employee
                </button>
              </>
            ) : null}
          </div>
        </div>

        {pageError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {pageError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Profile Details</h2>
              <p className="mt-1 text-sm text-slate-400">Employee identity and banking details.</p>
            </div>

            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                employee.status === 'Active'
                  ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
                  : 'bg-slate-700 text-slate-300 ring-1 ring-slate-600'
              }`}
            >
              {employee.status || 'Unknown'}
            </span>
          </div>

          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['NIC', employee.nic],
              ['Designation', employee.designation],
              ['Department', employee.department],
              ['Branch', employee.branch],
              ['Start Date', dateValue(employee.start_date)],
              ['Contract Type', employee.contract_type],
              ['TIN', employee.tin],
              ['Bank Name', employee.bank_name],
              ['Bank Branch', employee.bank_branch],
              ['Account Number', employee.account_number],
              ['Current Basic Salary', activeSalary ? currency(activeSalary.basic_salary) : '—'],
              ['Current OT Rate', activeSalary ? currency(activeSalary.hourly_ot_rate) : '—'],
            ].map(([label, value]) => renderMeta(label, value))}
          </dl>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-lg font-semibold">Salary History</h2>
            <p className="mt-1 text-sm text-slate-400">Track current and previous salary revisions.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800/80 text-left text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  {['Basic Salary', 'OT Rate', 'Effective Date', 'End Date', 'Status'].map((label) => (
                    <th key={label} className="px-5 py-4 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {salaryHistory.length === 0 ? (
                  <tr>
                    <td className="px-5 py-12 text-center text-slate-400" colSpan={5}>
                      No salary records available.
                    </td>
                  </tr>
                ) : (
                  salaryHistory.map((item) => {
                    const isActiveRow = !item.end_date;
                    return (
                      <tr
                        className={isActiveRow ? 'bg-emerald-500/5' : ''}
                        key={item.id || `${item.effective_date}-${item.basic_salary}`}
                      >
                        <td className="px-5 py-4 font-medium text-white">{currency(item.basic_salary)}</td>
                        <td className="px-5 py-4 text-slate-300">{currency(item.hourly_ot_rate)}</td>
                        <td className="px-5 py-4 text-slate-300">{dateValue(item.effective_date)}</td>
                        <td className="px-5 py-4 text-slate-400">{dateValue(item.end_date)}</td>
                        <td className="px-5 py-4">
                          {isActiveRow ? (
                            <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/20">
                              Active
                            </span>
                          ) : (
                            <span className="text-slate-400">Archived</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showSalaryModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Revise Salary</h3>
            <p className="mt-1 text-sm text-slate-400">
              Update the salary details for {employee.full_name}.
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleSalarySubmit}>
              {[
                ['Basic Salary', 'basic_salary'],
                ['Hourly OT Rate', 'hourly_ot_rate'],
              ].map(([label, field]) => (
                <div key={field}>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor={field}>
                    {label}
                  </label>
                  <input
                    className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 ${
                      salaryErrors[field] ? 'border-red-500/80' : 'border-slate-700'
                    }`}
                    id={field}
                    onChange={updateSalaryField(field)}
                    step="0.01"
                    type="number"
                    value={salaryForm[field]}
                  />
                  {salaryErrors[field] ? (
                    <p className="mt-1.5 text-xs text-red-400">{salaryErrors[field]}</p>
                  ) : null}
                </div>
              ))}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="effective_date">
                  Effective Date
                </label>
                <input
                  className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 ${
                    salaryErrors.effective_date ? 'border-red-500/80' : 'border-slate-700'
                  }`}
                  id="effective_date"
                  onChange={updateSalaryField('effective_date')}
                  type="date"
                  value={salaryForm.effective_date}
                />
                {salaryErrors.effective_date ? (
                  <p className="mt-1.5 text-xs text-red-400">{salaryErrors.effective_date}</p>
                ) : null}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                  onClick={() => setShowSalaryModal(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSavingSalary}
                  type="submit"
                >
                  {isSavingSalary ? 'Saving...' : 'Save Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showDeactivateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Deactivate Employee</h3>
            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to deactivate <span className="font-medium text-white">{employee.full_name}</span>?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                onClick={() => setShowDeactivateModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isDeactivating}
                onClick={handleDeactivate}
                type="button"
              >
                {isDeactivating ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
