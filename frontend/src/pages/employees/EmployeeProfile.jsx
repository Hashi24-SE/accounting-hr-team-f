import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Spin, Modal, Form, Input, DatePicker, message } from 'antd';
import {
  ArrowLeftOutlined, CopyOutlined, DollarOutlined,
  CheckOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  User, Briefcase, Building2, CreditCard,
  TrendingUp, Calendar, Hash, ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Status config ──────────────────────────────── */
const STATUS_CFG = {
  Active:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', glow: '#10b981' },
  Inactive:  { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', glow: '#f87171' },
  'On Leave':{ color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  glow: '#fbbf24' },
  Suspended: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)', glow: '#94a3b8' },
};

/* ── Small reusables ────────────────────────────── */
const DetailRow = ({ label, value, mono, copyable, onCopy }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <span style={{ color: '#4b5563', fontSize: 12, fontWeight: 500, letterSpacing: '0.03em' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#e5e7eb', fontSize: 13, fontFamily: mono ? 'monospace' : 'inherit' }}>{value || '—'}</span>
      {copyable && value && (
        <button onClick={onCopy} style={{
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: 6, padding: '2px 6px', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}>
          <CopyOutlined style={{ fontSize: 11 }} />
        </button>
      )}
    </div>
  </div>
);

const InfoCard = ({ icon, title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    style={{
      background: 'rgba(8,20,13,0.8)', border: '1px solid rgba(16,185,129,0.1)',
      borderRadius: 14, overflow: 'hidden',
    }}
  >
    <div style={{
      padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
      background: 'rgba(16,185,129,0.03)',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981',
      }}>
        {icon}
      </div>
      <span style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 600 }}>{title}</span>
    </div>
    <div style={{ padding: '4px 20px 12px' }}>{children}</div>
  </motion.div>
);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtCurrency = (n) => `LKR ${Number(n).toLocaleString()}`;

/* ── Main ───────────────────────────────────────── */
const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSalaryModal, setIsSalaryModal] = useState(false);
  const [isDeactivateModal, setIsDeactivateModal] = useState(false);
  const [salaryForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/api/employees/${id}`);
      if (res.data?.success) {
        setEmployee(res.data.data);
        setSalaries(res.data.data.salary_revisions || []);
      }
    } catch { navigate('/employees'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const copy = (text, label) => { navigator.clipboard.writeText(text); message.success(`${label} copied`); };

  const handleSalarySubmit = async (values) => {
    setSaving(true);
    try {
      const res = await api.post(`/api/employees/${id}/salary`, {
        employee_id: id,
        basic_salary: Number(values.basic_salary),
        hourly_ot_rate: Number(values.hourly_ot_rate),
        effective_date: values.effective_date.format('YYYY-MM-DD'),
      });
      if (res.data?.success) { setIsSalaryModal(false); salaryForm.resetFields(); fetchData(); }
    } finally { setSaving(false); }
  };

  const handleDeactivate = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/api/employees/${id}/status`, { status: 'Inactive' });
      if (res.data?.success) { setIsDeactivateModal(false); fetchData(); }
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320, flexDirection: 'column', gap: 14 }}>
      <Spin size="large" />
      <span style={{ color: '#4b5563', fontSize: 13 }}>Loading employee data…</span>
    </div>
  );
  if (!employee) return null;

  const statusCfg = STATUS_CFG[employee.status] || STATUS_CFG.Suspended;
  const activeSalary = salaries.find(s => s.end_date === null);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Top nav bar ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <button onClick={() => navigate('/employees')} style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 9, padding: '8px 14px', color: '#9ca3af', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e5e7eb'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#9ca3af'; }}
        >
          <ArrowLeftOutlined style={{ fontSize: 12 }} /> Back to Directory
        </button>

        {employee.status === 'Active' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setIsSalaryModal(true)} style={{
              background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none',
              borderRadius: 9, padding: '9px 18px', color: '#fff', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 14px rgba(16,185,129,0.3)', fontFamily: 'inherit',
            }}>
              <TrendingUp size={14} /> Revise Salary
            </motion.button>
            <button onClick={() => setIsDeactivateModal(true)} style={{
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 9, padding: '9px 18px', color: '#f87171', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
            >
              <AlertTriangle size={14} /> Deactivate
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Hero card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background: 'rgba(8,20,13,0.9)', border: '1px solid rgba(16,185,129,0.12)',
          borderRadius: 18, padding: '28px 32px', marginBottom: 20,
          backgroundImage: 'radial-gradient(ellipse 60% 80% at 95% 50%, rgba(16,185,129,0.04) 0%, transparent 60%)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(16,185,129,0.1)', border: `2px solid ${statusCfg.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, fontWeight: 700, color: '#10b981',
          boxShadow: `0 0 24px rgba(16,185,129,0.15)`,
        }}>
          {employee.full_name.charAt(0)}
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 style={{ color: '#f9fafb', fontSize: 24, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            {employee.full_name}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <span style={{
              background: statusCfg.bg, border: `1px solid ${statusCfg.border}`,
              color: statusCfg.color, borderRadius: 20, padding: '3px 12px',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusCfg.color, boxShadow: `0 0 6px ${statusCfg.glow}` }} />
              {employee.status.toUpperCase()}
            </span>
            <span style={{ color: '#10b981', fontSize: 13, fontWeight: 500 }}>{employee.designation}</span>
            <span style={{ color: '#4b5563', fontSize: 13 }}>·</span>
            <span style={{ color: '#6b7280', fontSize: 13 }}>{employee.department}</span>
          </div>
        </div>

        {/* Active salary chip */}
        {activeSalary && (
          <div style={{
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 12, padding: '12px 20px', textAlign: 'right',
          }}>
            <div style={{ color: '#4b5563', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>Current Salary</div>
            <div style={{ color: '#10b981', fontSize: 20, fontWeight: 700 }}>
              {fmtCurrency(activeSalary.basic_salary)}
            </div>
            <div style={{ color: '#374151', fontSize: 11, marginTop: 2 }}>
              OT: {fmtCurrency(activeSalary.hourly_ot_rate)}/hr
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <InfoCard icon={<User size={15} />} title="Personal Details" delay={0.1}>
            <DetailRow label="Employee ID" value={employee.id?.substring(0, 8)} mono copyable onCopy={() => copy(employee.id, 'Employee ID')} />
            <DetailRow label="NIC" value={employee.nic} mono copyable onCopy={() => copy(employee.nic, 'NIC')} />
            <DetailRow label="Date of Birth" value={fmtDate(employee.dob)} />
            <DetailRow label="Tax ID (TIN)" value={employee.tin} />
          </InfoCard>

          <InfoCard icon={<Briefcase size={15} />} title="Employment Details" delay={0.15}>
            <DetailRow label="Department" value={employee.department} />
            <DetailRow label="Branch" value={employee.branch} />
            <DetailRow label="Start Date" value={fmtDate(employee.start_date)} />
            <DetailRow label="Contract Type" value={employee.contract_type} />
          </InfoCard>

          <InfoCard icon={<CreditCard size={15} />} title="Bank Details" delay={0.2}>
            <DetailRow label="Bank" value={employee.bank_name} />
            <DetailRow label="Bank Branch" value={employee.bank_branch} />
            <DetailRow label="Account Number" value={employee.account_number} mono copyable onCopy={() => copy(employee.account_number, 'Account number')} />
          </InfoCard>
        </div>

        {/* Right — Salary history */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.35 }}
          style={{
            background: 'rgba(8,20,13,0.8)', border: '1px solid rgba(16,185,129,0.1)',
            borderRadius: 14, overflow: 'hidden', position: 'sticky', top: 80,
          }}
        >
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(16,185,129,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981',
              }}>
                <TrendingUp size={15} />
              </div>
              <span style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 600 }}>Salary History</span>
            </div>
            <span style={{ color: '#374151', fontSize: 12 }}>{salaries.length} revision{salaries.length !== 1 ? 's' : ''}</span>
          </div>

          <div style={{ maxHeight: 440, overflowY: 'auto' }}>
            {salaries.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#374151' }}>
                <TrendingUp size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div style={{ fontSize: 13 }}>No salary records yet</div>
              </div>
            ) : salaries.map((s, i) => (
              <div key={i} style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: s.end_date === null ? 'rgba(16,185,129,0.04)' : 'transparent',
                borderLeft: s.end_date === null ? '2px solid #10b981' : '2px solid transparent',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ color: s.end_date === null ? '#10b981' : '#e5e7eb', fontSize: 15, fontWeight: 700 }}>
                    {fmtCurrency(s.basic_salary)}
                  </span>
                  {s.end_date === null && (
                    <span style={{
                      background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                      color: '#10b981', borderRadius: 20, padding: '2px 8px',
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                    }}>ACTIVE</span>
                  )}
                </div>
                <div style={{ color: '#4b5563', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span>OT: {fmtCurrency(s.hourly_ot_rate)}/hr</span>
                  <span>From: {fmtDate(s.effective_date)}</span>
                  {s.end_date && <span>To: {fmtDate(s.end_date)}</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Salary revision modal ── */}
      <Modal
        title={<span style={{ color: '#f9fafb' }}>Revise Salary</span>}
        open={isSalaryModal}
        onCancel={() => setIsSalaryModal(false)}
        footer={null}
        styles={{ content: { background: 'rgba(8,20,13,0.98)', border: '1px solid rgba(16,185,129,0.15)' }, header: { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.06)' }, mask: { backdropFilter: 'blur(4px)' } }}
      >
        <Form form={salaryForm} layout="vertical" onFinish={handleSalarySubmit} style={{ marginTop: 16 }}>
          {[
            { name: 'basic_salary',   label: 'New Basic Salary (LKR)' },
            { name: 'hourly_ot_rate', label: 'New Hourly OT Rate (LKR)' },
          ].map(f => (
            <Form.Item key={f.name} name={f.name} label={<span style={{ color: '#9ca3af', fontSize: 12 }}>{f.label}</span>} rules={[{ required: true }]}>
              <Input prefix="Rs." type="number" size="large"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#f9fafb', borderRadius: 9 }} />
            </Form.Item>
          ))}
          <Form.Item name="effective_date" label={<span style={{ color: '#9ca3af', fontSize: 12 }}>Effective Date</span>} rules={[{ required: true }]}>
            <DatePicker size="large" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9 }} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setIsSalaryModal(false)} type="button" style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 9, padding: '9px 18px', color: '#9ca3af', cursor: 'pointer', fontFamily: 'inherit',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              background: 'linear-gradient(135deg,#059669,#10b981)', border: 'none',
              borderRadius: 9, padding: '9px 18px', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Saving…' : 'Save Revision'}
            </button>
          </div>
        </Form>
      </Modal>

      {/* ── Deactivate modal ── */}
      <Modal
        title={<span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={16} /> Confirm Deactivation</span>}
        open={isDeactivateModal}
        onCancel={() => setIsDeactivateModal(false)}
        onOk={handleDeactivate}
        confirmLoading={saving}
        okText="Deactivate"
        okButtonProps={{ danger: true, style: { borderRadius: 8 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        styles={{ content: { background: 'rgba(8,20,13,0.98)', border: '1px solid rgba(248,113,113,0.2)' }, header: { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.06)' }, mask: { backdropFilter: 'blur(4px)' } }}
      >
        <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>
          Are you sure you want to deactivate <strong style={{ color: '#f9fafb' }}>{employee?.full_name}</strong>?
          This will restrict their system access and mark them as Inactive.
        </p>
      </Modal>

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.2); border-radius: 4px; }
        .ant-modal-content { padding: 0 !important; }
        .ant-modal-header { padding: 16px 24px !important; }
        .ant-modal-body { padding: 16px 24px 24px !important; }
        .ant-input { background: transparent !important; color: #f9fafb !important; }
        .ant-input::placeholder { color: #374151 !important; }
        .ant-form-item-label > label { color: #9ca3af !important; }
        .ant-picker { background: rgba(255,255,255,0.03) !important; border-color: rgba(255,255,255,0.08) !important; }
        .ant-picker-input > input { color: #f9fafb !important; }
      `}</style>
    </div>
  );
};

export default EmployeeProfile;