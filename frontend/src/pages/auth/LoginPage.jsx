import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';

const initialForm = {
  email: '',
  password: '',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => form.email.trim() && form.password.trim() && !isSubmitting,
    [form.email, form.password, isSubmitting],
  );

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: '' }));
    setSubmitError('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Password is required.';
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
    setSubmitError('');

    try {
      await login(form.email.trim(), form.password);
      navigate('/employees', { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.code;

      setSubmitError(
        typeof message === 'string' && /invalid|credential/i.test(message)
          ? 'Invalid email or password.'
          : 'Unable to sign in right now. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName = (hasError) =>
    `w-full rounded-xl border bg-slate-900 px-4 py-3 text-sm text-white outline-none transition
     placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 ${
       hasError ? 'border-red-500/80' : 'border-slate-700'
     }`;

  return (
    <div className="min-h-screen bg-slate-950 px-4 text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-black/20">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 6v12m6-6H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Green Solutions</h1>
            <p className="mt-2 text-sm text-slate-400">Sign in to access the HR payroll dashboard.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                autoComplete="email"
                autoFocus
                className={inputClassName(Boolean(errors.email))}
                onChange={updateField('email')}
                placeholder="admin@greensolutions.tech"
                type="email"
                value={form.email}
              />
              {errors.email ? <p className="mt-1.5 text-xs text-red-400">{errors.email}</p> : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                autoComplete="current-password"
                className={inputClassName(Boolean(errors.password))}
                onChange={updateField('password')}
                placeholder="••••••••"
                type="password"
                value={form.password}
              />
              {errors.password ? (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              ) : null}
            </div>

            {submitError ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {submitError}
              </div>
            ) : null}

            <button
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canSubmit}
              type="submit"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center text-sm text-slate-400">
              Forgot your password?{' '}
              <button
                className="font-medium text-emerald-400 transition hover:text-emerald-300"
                type="button"
              >
                Reset it
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
