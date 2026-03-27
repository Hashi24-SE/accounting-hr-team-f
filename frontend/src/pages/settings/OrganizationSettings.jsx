import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Form, Input, Spin } from 'antd';
import {
  SaveOutlined,
  BankOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { TextArea } = Input;

/* ── tiny helpers ───────────────────────────────────── */
const Label = ({ icon, children }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af', fontSize: 12, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
    {icon}
    {children}
  </span>
);

const inputStyle = (focused) => ({
  background: focused ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
  border: `1px solid ${focused ? 'rgba(16,185,129,0.45)' : 'rgba(255,255,255,0.08)'}`,
  borderRadius: 10,
  color: '#f9fafb',
  fontSize: 14,
  transition: 'all 0.22s ease',
  boxShadow: focused ? '0 0 0 3px rgba(16,185,129,0.08)' : 'none',
});

/* ── Field wrapper with focus tracking ─────────────── */
const Field = ({ name, label, icon, rules, extra, children, colSpan = 'full' }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ gridColumn: colSpan === 'half' ? 'span 1' : 'span 2' }}>
      <Form.Item name={name} rules={rules} style={{ marginBottom: 0 }}
        label={<Label icon={icon}>{label}</Label>}
      >
        {/* clone child to inject focus handlers + style */}
        {typeof children === 'function'
          ? children({ focused, setFocused, inputStyle: inputStyle(focused) })
          : children}
      </Form.Item>
      {extra && (
        <p style={{ color: '#4b5563', fontSize: 11.5, marginTop: 5, marginLeft: 2 }}>{extra}</p>
      )}
    </div>
  );
};

/* ── Section card ───────────────────────────────────── */
const Section = ({ title, subtitle, icon, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
    style={{
      background: 'rgba(8, 20, 13, 0.8)',
      border: '1px solid rgba(16,185,129,0.1)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
    }}
  >
    {/* Section header */}
    <div style={{
      padding: '18px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(16,185,129,0.03)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: 'rgba(16,185,129,0.12)',
        border: '1px solid rgba(16,185,129,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#10b981', fontSize: 16,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ color: '#4b5563', fontSize: 12, marginTop: 1 }}>{subtitle}</div>
      </div>
    </div>

    <div style={{ padding: '24px' }}>
      {children}
    </div>
  </motion.div>
);

/* ── Main ───────────────────────────────────────────── */
const OrganizationSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoError, setLogoError] = useState(false);

  // per-field focus tracking
  const [focused, setFocused] = useState({});
  const fProps = (field) => ({
    onFocus: () => setFocused((p) => ({ ...p, [field]: true })),
    onBlur:  () => setFocused((p) => ({ ...p, [field]: false })),
    style: inputStyle(!!focused[field]),
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/organization');
        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          form.setFieldsValue({ name: d.name || '', address: d.address || '', phone: d.phone || '', email: d.email || '', logo_url: d.logo_url || '' });
          setLogoPreview(d.logo_url || '');
        }
      } catch { /* global handler */ }
      finally { setLoading(false); }
    };
    fetch();
  }, [form]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const res = await api.put('/api/organization', values);
      if (res.data?.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch { /* global handler */ }
    finally { setSaving(false); }
  };

  /* ── Loading screen ── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌿</div>
      <Spin size="large" style={{ color: '#10b981' }} />
      <span style={{ color: '#4b5563', fontSize: 13 }}>Loading organization settings…</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '8px 0 40px', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ color: '#f9fafb', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.3 }}>
              Organization Settings
            </h1>
            <p style={{ color: '#4b5563', fontSize: 13, margin: '4px 0 0' }}>
              Manage your company profile, branding & contact details
            </p>
          </div>

          {/* Status pill */}
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 20, padding: '6px 14px',
                  color: '#10b981', fontSize: 13, fontWeight: 500,
                }}
              >
                <CheckOutlined style={{ fontSize: 12 }} />
                Changes saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(16,185,129,0.2), transparent)', marginTop: 18 }} />
      </motion.div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Company Identity ── */}
          <Section title="Company Identity" subtitle="Legal name and address of your organization" icon="🏢" delay={0.05}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

              {/* Company name — full width */}
              <div style={{ gridColumn: 'span 2' }}>
                <Form.Item
                  name="name"
                  label={<Label icon={<BankOutlined style={{ fontSize: 11 }} />}>Company Name</Label>}
                  rules={[{ required: true, message: 'Company name is required' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Green Solutions Tech" size="large" {...fProps('name')} />
                </Form.Item>
              </div>

              {/* Address — full width */}
              <div style={{ gridColumn: 'span 2' }}>
                <Form.Item
                  name="address"
                  label={<Label icon={<EnvironmentOutlined style={{ fontSize: 11 }} />}>Address</Label>}
                  style={{ marginBottom: 0 }}
                >
                  <TextArea
                    rows={3}
                    placeholder="123 Green Ave, Colombo 03, Sri Lanka"
                    {...fProps('address')}
                    style={{ ...inputStyle(!!focused['address']), resize: 'none' }}
                  />
                </Form.Item>
              </div>
            </div>
          </Section>

          {/* ── Contact Details ── */}
          <Section title="Contact Details" subtitle="How clients and employees can reach you" icon="📞" delay={0.1}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

              <div>
                <Form.Item
                  name="phone"
                  label={<Label icon={<PhoneOutlined style={{ fontSize: 11 }} />}>Phone Number</Label>}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="+94 11 234 5678" size="large" {...fProps('phone')} />
                </Form.Item>
              </div>

              <div>
                <Form.Item
                  name="email"
                  label={<Label icon={<MailOutlined style={{ fontSize: 11 }} />}>Contact Email</Label>}
                  rules={[{ type: 'email', message: 'Enter a valid email' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="contact@greensolutions.tech" size="large" {...fProps('email')} />
                </Form.Item>
              </div>
            </div>
          </Section>

          {/* ── Branding ── */}
          <Section title="Branding" subtitle="Logo used on payslips and system documents" icon="🎨" delay={0.15}>
            <Form.Item
              name="logo_url"
              label={<Label icon={<LinkOutlined style={{ fontSize: 11 }} />}>Logo URL</Label>}
              rules={[{ type: 'url', message: 'Must be a valid URL' }]}
              style={{ marginBottom: 0 }}
            >
              <Input
                placeholder="https://example.com/logo.png"
                size="large"
                {...fProps('logo_url')}
                onChange={(e) => {
                  setLogoPreview(e.target.value);
                  setLogoError(false);
                  fProps('logo_url').onChange?.(e);
                }}
              />
            </Form.Item>

            <p style={{ color: '#4b5563', fontSize: 12, margin: '6px 0 16px 2px' }}>
              Provide a direct HTTPS URL to your company logo image.
            </p>

            {/* Logo preview */}
            <AnimatePresence>
              {logoPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: 'inline-flex', flexDirection: 'column', gap: 10,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12, padding: '14px 18px',
                  }}
                >
                  <span style={{ color: '#4b5563', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Preview
                  </span>
                  {!logoError ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      style={{ maxHeight: 56, maxWidth: 200, objectFit: 'contain' }}
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div style={{ color: '#f87171', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      ⚠ Could not load image — check the URL
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

        </div>

        {/* ── Footer action bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: 24,
            padding: '16px 24px',
            background: 'rgba(8,20,13,0.8)',
            border: '1px solid rgba(16,185,129,0.1)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span style={{ color: '#4b5563', fontSize: 12 }}>
            Changes apply immediately across all payroll documents.
          </span>

          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: saving ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg, #059669, #10b981)',
              border: 'none', borderRadius: 10,
              padding: '10px 24px',
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 16px rgba(16,185,129,0.3)',
              transition: 'all 0.25s ease',
              fontFamily: 'inherit',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.boxShadow = '0 6px 24px rgba(16,185,129,0.45)'; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.3)'; }}
          >
            {saving ? (
              <>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Saving…
              </>
            ) : saved ? (
              <><CheckOutlined /> Saved</>
            ) : (
              <><SaveOutlined /> Save Changes</>
            )}
          </button>
        </motion.div>
      </Form>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ant-input, .ant-input-affix-wrapper, .ant-input-textarea textarea {
          background: transparent !important;
          color: #f9fafb !important;
        }
        .ant-input::placeholder,
        .ant-input-textarea textarea::placeholder { color: #374151 !important; }
        .ant-input-affix-wrapper:hover,
        .ant-input:hover { border-color: rgba(16,185,129,0.3) !important; }
        .ant-form-item-label > label { color: #9ca3af !important; }
        .ant-form-item-explain-error { color: #f87171 !important; font-size: 12px !important; }
        .ant-form-item { margin-bottom: 0 !important; }
      `}</style>
    </div>
  );
};

export default OrganizationSettings;