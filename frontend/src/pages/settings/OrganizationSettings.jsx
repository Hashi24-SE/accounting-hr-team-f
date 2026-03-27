import { useEffect, useMemo, useState } from 'react';
import api, { extractApiErrorMessage } from '../../services/api';

const initialForm = {
  name: '',
  address: '',
  phone: '',
  email: '',
  logo_url: '',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRegex = /^https?:\/\/.+/i;

export default function OrganizationSettings() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [pageError, setPageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const hasLogoPreview = useMemo(() => urlRegex.test(form.logo_url.trim()), [form.logo_url]);

  useEffect(() => {
    const loadOrganization = async () => {
      setIsLoading(true);
      setPageError('');

      try {
        const response = await api.get('/api/organization');
        const payload = response?.data?.data ?? {};
        setForm({ ...initialForm, ...payload });
      } catch (error) {
        setPageError(
          extractApiErrorMessage(error, 'Could not load organization settings right now.'),
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganization();
  }, []);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: '' }));
    setSuccessMessage('');
    setPageError('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Company name is required.';
    }

    if (form.email.trim() && !emailRegex.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (form.logo_url.trim() && !urlRegex.test(form.logo_url.trim())) {
      nextErrors.logo_url = 'Enter a valid URL starting with http or https.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    setSuccessMessage('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    setPageError('');

    try {
      await api.put('/api/organization', {
        ...form,
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        logo_url: form.logo_url.trim(),
      });
      setSuccessMessage('Settings saved successfully.');
    } catch (error) {
      setPageError(extractApiErrorMessage(error, 'Failed to save organization settings.'));
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = ({ label, field, type = 'text', placeholder = '' }) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor={field}>
        {label}
      </label>
      <input
        className={`w-full rounded-xl border bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 ${
          errors[field] ? 'border-red-500/80' : 'border-slate-700'
        }`}
        id={field}
        onChange={updateField(field)}
        placeholder={placeholder}
        type={type}
        value={form[field]}
      />
      {errors[field] ? <p className="mt-1.5 text-xs text-red-400">{errors[field]}</p> : null}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <div className="h-6 w-48 rounded bg-slate-800" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-20 rounded-2xl bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organization Settings</h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage the company information shown across the payroll system.
          </p>
        </div>

        <form
          className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/10"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5 md:grid-cols-2">
            {renderInput({
              label: 'Company name',
              field: 'name',
              placeholder: 'Green Solutions Tech',
            })}
            {renderInput({
              label: 'Phone',
              field: 'phone',
              placeholder: '+94 11 234 5678',
            })}
            <div className="md:col-span-2">
              {renderInput({
                label: 'Registered address',
                field: 'address',
                placeholder: '123 Galle Road, Colombo 03',
              })}
            </div>
            {renderInput({
              label: 'Email',
              field: 'email',
              type: 'email',
              placeholder: 'hr@greensolutions.tech',
            })}
            {renderInput({
              label: 'Logo URL',
              field: 'logo_url',
              type: 'url',
              placeholder: 'https://example.com/logo.png',
            })}
          </div>

          {hasLogoPreview ? (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="mb-3 text-sm font-medium text-slate-300">Logo preview</p>
              <img
                alt="Organization logo preview"
                className="max-h-24 rounded-lg border border-slate-800 bg-white p-2"
                src={form.logo_url}
              />
            </div>
          ) : null}

          {pageError ? (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {pageError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {successMessage}
            </div>
          ) : null}

          <div className="mt-6 flex justify-end">
            <button
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? 'Saving...' : 'Save settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
