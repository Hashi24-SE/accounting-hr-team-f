import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Form, Input, Select, DatePicker } from 'antd';
import { User, Briefcase, CreditCard, CheckCircle, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Step config ───────────────────────────────── */
const STEPS = [
  { key: 'personal',    label: 'Personal',    icon: User,        sub: 'Identity & basic info' },
  { key: 'employment',  label: 'Employment',  icon: Briefcase,   sub: 'Role & department'     },
  { key: 'salary',      label: 'Salary & Bank', icon: CreditCard, sub: 'Compensation details' },
];

const DEPARTMENTS = ['HR','IT','Finance','Engineering','Marketing','Operations','Sales','Administration'];
const CONTRACT_TYPES = ['Permanent','Contract','Probation','Internship'];

/* ── Shared input style ────────────────────────── */
const iStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 9, color: '#f9fafb', fontSize: 14,
};
const Label = ({ children, required }) => (
  <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
    {children}{required && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
  </span>
);
const FormGrid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>{children}</div>
);
const Full = ({ children }) => <div style={{ gridColumn: 'span 2' }}>{children}</div>;

/* ── Step indicator ────────────────────────────── */
const StepBar = ({ current }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
    {STEPS.map((step, i) => {
      const Icon = step.icon;
      const done    = i < current;
      const active  = i === current;
      const pending = i > current;
      return (
        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <motion.div
              animate={{
                background: done ? 'linear-gradient(135deg,#059669,#10b981)' : active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                border: done ? '2px solid transparent' : active ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.08)',
                boxShadow: active ? '0 0 16px rgba(16,185,129,0.25)' : 'none',
              }}
              transition={{ duration: 0.3 }}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {done
                ? <CheckCircle size={18} style={{ color: '#fff' }} />
                : <Icon size={18} style={{ color: active ? '#10b981' : '#374151' }} />
              }
            </motion.div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: active ? '#e5e7eb' : done ? '#10b981' : '#4b5563', fontSize: 12, fontWeight: 600 }}>
                {step.label}
              </div>
              <div style={{ color: '#374151', fontSize: 11 }}>{step.sub}</div>
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              flex: 1, height: 1, margin: '0 12px',
              background: i < current ? 'linear-gradient(90deg,#10b981,rgba(16,185,129,0.3))' : 'rgba(255,255,255,0.06)',
              marginBottom: 30, transition: 'background 0.4s',
            }} />
          )}
        </div>
      );
    })}
  </div>
);

/* ── Step content panels ───────────────────────── */
const PersonalStep = ({ form }) => (
  <FormGrid>
    <Full>
      <Form.Item name="full_name" label={<Label required>Full Name</Label>} rules={[{ required: true, message: 'Full name is required' }]}>
        <Input size="large" placeholder="e.g. Dilshan Perera" style={iStyle} />
      </Form.Item>
    </Full>
    <Form.Item
      name="nic"
      label={<Label required>NIC Number</Label>}
      rules={[
        { required: true, message: 'NIC is required' },
        { pattern: /^([0-9]{9}[vVxX]|[0-9]{12})$/, message: 'Invalid NIC format' },
      ]}
    >
      <Input size="large" placeholder="199012345678 or 940234567V" style={iStyle}
        onChange={e => form.setFieldsValue({ nic: e.target.value.toUpperCase() })} />
    </Form.Item>
    <Form.Item name="dob" label={<Label required>Date of Birth</Label>} rules={[{ required: true, message: 'DOB is required' }]}>
      <DatePicker size="large" style={{ ...iStyle, width: '100%' }} />
    </Form.Item>
    <Form.Item name="tin" label={<Label>Tax ID (TIN)</Label>}>
      <Input size="large" placeholder="Optional" style={iStyle} />
    </Form.Item>
  </FormGrid>
);

const EmploymentStep = () => (
  <FormGrid>
    <Form.Item name="designation" label={<Label required>Designation</Label>} rules={[{ required: true, message: 'Designation is required' }]}>
      <Input size="large" placeholder="e.g. Software Engineer" style={iStyle} />
    </Form.Item>
    <Form.Item name="department" label={<Label required>Department</Label>} rules={[{ required: true, message: 'Department is required' }]}>
      <Select size="large" placeholder="Select Department" style={{ ...iStyle }} popupClassName="dark-select-dropdown">
        {DEPARTMENTS.map(d => <Select.Option key={d} value={d}>{d}</Select.Option>)}
      </Select>
    </Form.Item>
    <Form.Item name="branch" label={<Label required>Branch</Label>} rules={[{ required: true, message: 'Branch is required' }]}>
      <Input size="large" placeholder="e.g. Colombo Main" style={iStyle} />
    </Form.Item>
    <Form.Item name="start_date" label={<Label required>Start Date</Label>} rules={[{ required: true, message: 'Start date is required' }]}>
      <DatePicker size="large" style={{ ...iStyle, width: '100%' }} />
    </Form.Item>
    <Form.Item name="contract_type" label={<Label required>Contract Type</Label>} rules={[{ required: true, message: 'Contract type is required' }]}>
      <Select size="large" placeholder="Select Type" popupClassName="dark-select-dropdown">
        {CONTRACT_TYPES.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
      </Select>
    </Form.Item>
  </FormGrid>
);

const SalaryStep = () => (
  <FormGrid>
    <Form.Item name="bank_name" label={<Label required>Bank Name</Label>} rules={[{ required: true, message: 'Bank name is required' }]}>
      <Input size="large" placeholder="e.g. Commercial Bank" style={iStyle} />
    </Form.Item>
    <Form.Item name="bank_branch" label={<Label required>Bank Branch</Label>} rules={[{ required: true, message: 'Bank branch is required' }]}>
      <Input size="large" placeholder="e.g. Colombo 03" style={iStyle} />
    </Form.Item>
    <Full>
      <Form.Item name="account_number" label={<Label required>Account Number</Label>} rules={[{ required: true, message: 'Account number is required' }]}>
        <Input size="large" placeholder="e.g. 1002345678" style={{ ...iStyle, fontFamily: 'monospace' }} />
      </Form.Item>
    </Full>
    <Form.Item name="basic_salary" label={<Label required>Basic Salary (LKR)</Label>} rules={[{ required: true, message: 'Basic salary is required' }]}>
      <Input size="large" prefix={<span style={{ color: '#4b5563', fontSize: 13 }}>Rs.</span>} type="number" placeholder="0.00" style={iStyle} />
    </Form.Item>
    <Form.Item name="hourly_ot_rate" label={<Label required>Hourly OT Rate (LKR)</Label>} rules={[{ required: true, message: 'OT rate is required' }]}>
      <Input size="large" prefix={<span style={{ color: '#4b5563', fontSize: 13 }}>Rs.</span>} type="number" placeholder="0.00" style={iStyle} />
    </Form.Item>
  </FormGrid>
);

/* ── Main ───────────────────────────────────────── */
const EmployeeRegistrationForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const next = async () => {
    try { await form.validateFields(); setCurrent(c => c + 1); } catch {}
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        dob: values.dob.format('YYYY-MM-DD'),
        start_date: values.start_date.format('YYYY-MM-DD'),
        basic_salary: Number(values.basic_salary),
        hourly_ot_rate: Number(values.hourly_ot_rate),
      };
      const res = await api.post('/api/employees', payload);
      if (res.data?.success) {
        setDone(true);
        setTimeout(() => navigate('/employees'), 2000);
      }
    } catch (err) {
      if (err?.response?.status === 409 && err?.response?.data?.code === 'DUPLICATE_NIC') {
        form.setFields([{ name: 'nic', errors: ['An employee with this NIC already exists'] }]);
        setCurrent(0);
      }
    } finally { setSaving(false); }
  };

  const stepContent = [
    <PersonalStep form={form} />,
    <EmploymentStep />,
    <SalaryStep />,
  ];

  /* Success screen */
  if (done) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 480, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
          background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(16,185,129,0.2)',
        }}>
          <CheckCircle size={36} style={{ color: '#10b981' }} />
        </div>
        <h2 style={{ color: '#f9fafb', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Employee Registered</h2>
        <p style={{ color: '#4b5563', fontSize: 14 }}>Redirecting to directory…</p>
      </motion.div>
    </div>
  );

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: '0 0 40px' }}>

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <button onClick={() => navigate('/employees')} style={{
            background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'inherit', padding: 0,
          }}>
            <ArrowLeft size={14} /> Directory
          </button>
          <span style={{ color: '#1f2937' }}>/</span>
          <span style={{ color: '#9ca3af', fontSize: 13 }}>Register Employee</span>
        </div>
        <h1 style={{ color: '#f9fafb', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Register New Employee</h1>
        <p style={{ color: '#4b5563', fontSize: 13, margin: '4px 0 0' }}>Complete all three steps to add the employee to the system</p>
        <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(16,185,129,0.2), transparent)', marginTop: 16 }} />
      </motion.div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4 }}
        style={{
          background: 'rgba(8,20,13,0.85)', border: '1px solid rgba(16,185,129,0.12)',
          borderRadius: 18, padding: '32px 36px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}
      >
        <StepBar current={current} />

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <div style={{ minHeight: 280 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
              >
                {stepContent[current]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            {current > 0 ? (
              <button type="button" onClick={() => setCurrent(c => c - 1)} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 9, padding: '10px 18px', color: '#9ca3af', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
              }}>
                <ChevronLeft size={15} /> Previous
              </button>
            ) : <div />}

            {current < STEPS.length - 1 ? (
              <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={next} style={{
                background: 'linear-gradient(135deg,#059669,#10b981)', border: 'none',
                borderRadius: 9, padding: '10px 22px', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              }}>
                Next Step <ChevronRight size={15} />
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={saving} style={{
                background: saving ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg,#059669,#10b981)',
                border: 'none', borderRadius: 9, padding: '10px 24px',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
                boxShadow: saving ? 'none' : '0 4px 16px rgba(16,185,129,0.35)',
              }}>
                {saving ? (
                  <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Registering…</>
                ) : (
                  <><CheckCircle size={15} /> Complete Registration</>
                )}
              </motion.button>
            )}
          </div>
        </Form>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ant-input, .ant-input-number-input { background: transparent !important; color: #f9fafb !important; }
        .ant-input::placeholder { color: #374151 !important; }
        .ant-input-affix-wrapper { background: rgba(255,255,255,0.03) !important; border-color: rgba(255,255,255,0.08) !important; border-radius: 9px !important; }
        .ant-select-selector { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 9px !important; color: #9ca3af !important; }
        .ant-select-selection-placeholder { color: #374151 !important; }
        .ant-select-arrow { color: #4b5563 !important; }
        .ant-picker { background: rgba(255,255,255,0.03) !important; border-color: rgba(255,255,255,0.08) !important; border-radius: 9px !important; }
        .ant-picker-input > input { color: #f9fafb !important; }
        .ant-picker-input > input::placeholder { color: #374151 !important; }
        .ant-form-item-label > label { color: #9ca3af !important; }
        .ant-form-item-explain-error { color: #f87171 !important; font-size: 12px !important; }
        .ant-form-item { margin-bottom: 18px !important; }
        .dark-select-dropdown { background: rgba(8,20,13,0.98) !important; border: 1px solid rgba(16,185,129,0.15) !important; border-radius: 10px !important; }
        .dark-select-dropdown .ant-select-item { color: #9ca3af !important; }
        .dark-select-dropdown .ant-select-item-option-active { background: rgba(16,185,129,0.08) !important; }
        .dark-select-dropdown .ant-select-item-option-selected { background: rgba(16,185,129,0.15) !important; color: #10b981 !important; }
      `}</style>
    </div>
  );
};

export default EmployeeRegistrationForm;