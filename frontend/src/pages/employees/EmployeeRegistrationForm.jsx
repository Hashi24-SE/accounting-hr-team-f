import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { extractApiErrorMessage } from '../../services/api';

const initialForm = {
  full_name: '',
  nic: '',
  dob: '',
  tin: '',
  designation: '',
  department: '',
  branch: '',
  start_date: '',
  contract_type: 'Permanent',
  bank_name: '',
  bank_branch: '',
  account_number: '',
  basic_salary: '',
  hourly_ot_rate: '',
};

const requiredFields = [
  'full_name',
  'nic',
  'dob',
  'designation',
  'department',
  'branch',
  'start_date',
  'contract_type',
  'bank_name',
  'bank_branch',
  'account_number',
  'basic_salary',
  'hourly_ot_rate',
];

const sectionClassName = 'rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/10';

export default function EmployeeRegistrationForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [pageError, setPageError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(() => isSubmitting, [isSubmitting]);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: '' }));
    setPageError('');
  };

  const validate = () => {
    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (!String(form[field] ?? '').trim()) {
        nextErrors[field] = 'This field is required.';
      }
    });

    if (form.nic.trim() && !/^\d{10,12}$/.test(form.nic.trim())) {
      nextErrors.nic = 'NIC must be 10 to 12 digits.';
    }

    if (form.basic_salary && Number(form.basic_salary) <= 0) {
      nextErrors.basic_salary = 'Basic salary must be a positive value.';
    }

    if (form.hourly_ot_rate && Number(form.hourly_ot_rate) <= 0) {
      nextErrors.hourly_ot_rate = 'Hourly OT rate must be a positive value.';
    }

    return nextErrors;
  };

  const mapBackendValidationErrors = (errorPayload) => {
    const nextErrors = {};
    const rawErrors = errorPayload?.errors;

    if (Array.isArray(rawErrors)) {
      rawErrors.forEach((message) => {
        if (typeof message !== 'string') return;
        if (/nic/i.test(message)) nextErrors.nic = message;
        if (/salary/i.test(message)) nextErrors.basic_salary = message;
        if (/ot/i.test(message)) nextErrors.hourly_ot_rate = message;
      });
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setPageError('');

    try {
      await api.post('/api/employees', {
        ...form,
        full_name: form.full_name.trim(),
        nic: form.nic.trim(),
        tin: form.tin.trim(),
        designation: form.designation.trim(),
        department: form.department.trim(),
        branch: form.branch.trim(),
        bank_name: form.bank_name.trim(),
        bank_branch: form.bank_branch.trim(),
        account_number: form.account_number.trim(),
        basic_salary: Number(form.basic_salary),
        hourly_ot_rate: Number(form.hourly_ot_rate),
      });

      navigate('/employees', {
        replace: true,
        state: { successMessage: 'Employee registered successfully.' },
      });
    } catch (error) {
      const responseData = error?.response?.data ?? {};
      const errorCode = responseData?.code;

      if (error?.response?.status === 409 || errorCode === 'DUPLICATE_NIC') {
        setErrors((previous) => ({
          ...previous,
          nic: 'An employee with this NIC already exists.',
        }));
      } else if (error?.response?.status === 400 || errorCode === 'VALIDATION_ERROR') {
        const backendErrors = mapBackendValidationErrors(responseData);
        if (Object.keys(backendErrors).length > 0) {
          setErrors((previous) => ({ ...previous, ...backendErrors }));
        } else {
          setPageError(
            extractApiErrorMessage(error, 'Please review the entered employee details.'),
          );
        }
      } else {
        setPageError(extractApiErrorMessage(error, 'Failed to register employee.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = ({
    label,
    field,
    type = 'text',
    placeholder = '',
    required = false,
    step,
  }) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor={field}>
        {label}
        {required ? <span className="ml-1 text-red-400">*</span> : null}
      </label>
      <input
        className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 ${
          errors[field] ? 'border-red-500/80' : 'border-slate-700'
        }`}
        id={field}
        onChange={updateField(field)}
        placeholder={placeholder}
        step={step}
        type={type}
        value={form[field]}
      />
      {errors[field] ? <p className="mt-1.5 text-xs text-red-400">{errors[field]}</p> : null}
    </div>
  );

  const renderSection = (title, children) => (
    <section className={sectionClassName}>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Register Employee</h1>
            <p className="mt-2 text-sm text-slate-400">
              Create a new employee profile with banking and salary details.
            </p>
          </div>

          <button
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
            onClick={() => navigate('/employees')}
            type="button"
          >
            Back to directory
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {renderSection(
            'Personal Details',
            <>
              {renderField({
                label: 'Full name',
                field: 'full_name',
                placeholder: 'Kasun Perera',
                required: true,
              })}
              {renderField({
                label: 'NIC',
                field: 'nic',
                placeholder: '200012345678',
                required: true,
              })}
              {renderField({
                label: 'Date of birth',
                field: 'dob',
                type: 'date',
                required: true,
              })}
              {renderField({
                label: 'TIN',
                field: 'tin',
                placeholder: 'Optional tax identification number',
              })}
            </>,
          )}

          {renderSection(
            'Employment Details',
            <>
              {renderField({
                label: 'Designation',
                field: 'designation',
                placeholder: 'Software Engineer',
                required: true,
              })}
              {renderField({
                label: 'Department',
                field: 'department',
                placeholder: 'Engineering',
                required: true,
              })}
              {renderField({
                label: 'Branch',
                field: 'branch',
                placeholder: 'Colombo HQ',
                required: true,
              })}
              {renderField({
                label: 'Start date',
                field: 'start_date',
                type: 'date',
                required: true,
              })}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="contract_type">
                  Contract Type<span className="ml-1 text-red-400">*</span>
                </label>
                <select
                  className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 ${
                    errors.contract_type ? 'border-red-500/80' : 'border-slate-700'
                  }`}
                  id="contract_type"
                  onChange={updateField('contract_type')}
                  value={form.contract_type}
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Probation">Probation</option>
                </select>
                {errors.contract_type ? (
                  <p className="mt-1.5 text-xs text-red-400">{errors.contract_type}</p>
                ) : null}
              </div>
            </>,
          )}

          {renderSection(
            'Bank Details',
            <>
              {renderField({
                label: 'Bank name',
                field: 'bank_name',
                placeholder: 'Bank of Ceylon',
                required: true,
              })}
              {renderField({
                label: 'Bank branch',
                field: 'bank_branch',
                placeholder: 'Colombo 01',
                required: true,
              })}
              {renderField({
                label: 'Account number',
                field: 'account_number',
                placeholder: '0012345678',
                required: true,
              })}
            </>,
          )}

          {renderSection(
            'Initial Salary',
            <>
              {renderField({
                label: 'Basic salary',
                field: 'basic_salary',
                type: 'number',
                placeholder: '75000',
                required: true,
                step: '0.01',
              })}
              {renderField({
                label: 'Hourly OT rate',
                field: 'hourly_ot_rate',
                type: 'number',
                placeholder: '468.75',
                required: true,
                step: '0.01',
              })}
            </>,
          )}

          {pageError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {pageError}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
              onClick={() => navigate('/employees')}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitDisabled}
              type="submit"
            >
              {isSubmitting ? 'Registering...' : 'Register Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
