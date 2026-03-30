import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Input, Select, Tag, Spin, Skeleton } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { Users, UserPlus, ChevronRight, Building2, GitBranch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';

/* ── Avatar initial ────────────────────────────── */
const EmpAvatar = ({ name, size = 36 }) => {
  const initials = name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '?';
  const hue = name ? (name.charCodeAt(0) * 37) % 360 : 160;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue}, 40%, 18%)`,
      border: `1.5px solid hsl(${hue}, 40%, 30%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: `hsl(${hue}, 60%, 65%)`,
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
      letterSpacing: '-0.02em',
    }}>
      {initials}
    </div>
  );
};

/* ── Filter pill ───────────────────────────────── */
const FilterSelect = ({ placeholder, options, onChange }) => (
  <Select
    placeholder={placeholder}
    allowClear
    onChange={onChange}
    style={{ minWidth: 160 }}
        classNames={{ popup: { root: 'dark-select-dropdown' } }}
    styles={{
      popup: { background: 'rgba(8,20,13,0.98)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10 },
    }}
  >
    {options.map(o => (
      <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>
    ))}
  </Select>
);

/* ── Main ──────────────────────────────────────── */
const EmployeeDirectory = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => localStorage.getItem('emp_dir_search') || '');
  const [department, setDepartment] = useState(() => localStorage.getItem('emp_dir_dept') || null);
  const [status, setStatus] = useState(() => localStorage.getItem('emp_dir_status') || null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => { localStorage.setItem('emp_dir_search', search); }, [search]);
  useEffect(() => {
    if (department) localStorage.setItem('emp_dir_dept', department);
    else localStorage.removeItem('emp_dir_dept');
  }, [department]);
  useEffect(() => {
    if (status) localStorage.setItem('emp_dir_status', status);
    else localStorage.removeItem('emp_dir_status');
  }, [status]);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(h);
  }, [search]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (department)      params.append('department', department);
      if (status)          params.append('status', status);
      const res = await api.get(`/api/employees?${params.toString()}`);
      if (res.data?.success) setEmployees(res.data.data || []);
    } catch { /* global */ }
    finally { setLoading(false); }
  }, [debouncedSearch, department, status]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const stats = {
    total:   employees.length,
    active:  employees.filter(e => e.status === 'Active').length,
    onLeave: employees.filter(e => e.status === 'On Leave').length,
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Page header ── */}
      <PageHeader
        title="Employee Directory"
        subtitle="View and manage all employee records"
        icon={Users}
        actions={
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/employees/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'linear-gradient(135deg, #059669, #10b981)',
              border: 'none', borderRadius: 10,
              padding: '10px 18px', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
              fontFamily: 'inherit',
            }}
          >
            <UserPlus size={15} /> Register Employee
          </motion.button>
        }
      />

      {/* ── Stat chips ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total',    value: stats.total,   color: '#e5e7eb' },
          { label: 'Active',   value: stats.active,  color: '#10b981' },
          { label: 'On Leave', value: stats.onLeave, color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(8,20,13,0.8)', border: '1px solid rgba(16,185,129,0.1)',
            borderRadius: 10, padding: '10px 18px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ color: s.color, fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{s.value}</span>
            <span style={{ color: '#4b5563', fontSize: 12 }}>{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* ── Filters ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
        style={{
          background: 'rgba(8,20,13,0.8)', border: '1px solid rgba(16,185,129,0.1)',
          borderRadius: 14, padding: '16px 20px', marginBottom: 20,
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
        }}>
        <Input
          placeholder="Search by name, ID, or NIC…"
          prefix={<SearchOutlined style={{ color: '#4b5563' }} />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          style={{
            width: 280, background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9,
            color: '#f9fafb',
          }}
        />
        <FilterSelect
          placeholder="All Departments"
          onChange={setDepartment}
          options={['HR','IT','Finance','Engineering','Marketing','Operations','Sales','Administration'].map(d => ({ value: d, label: d }))}
        />
        <FilterSelect
          placeholder="All Statuses"
          onChange={setStatus}
          options={['Active','Inactive','On Leave','Suspended'].map(s => ({ value: s, label: s }))}
        />
        {(search || department || status) && (
          <button onClick={() => { setSearch(''); setDepartment(null); setStatus(null); }}
            style={{ background: 'none', border: 'none', color: '#f87171', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Clear filters
          </button>
        )}
      </motion.div>

      {/* ── Table ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        style={{
          background: 'rgba(8,20,13,0.8)', border: '1px solid rgba(16,185,129,0.1)',
          borderRadius: 14, overflow: 'hidden',
        }}>

        {/* Table header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 1fr 0.6fr',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(16,185,129,0.03)',
          backdropFilter: 'blur(8px)',
        }}>
          {['Employee', 'NIC', 'Department', 'Branch', 'Status', ''].map((h, i) => (
            <span key={i} style={{ color: '#4b5563', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: '20px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} active paragraph={{ rows: 1 }} style={{ marginBottom: 20 }} />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#374151', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Users size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div style={{ fontSize: 15, fontWeight: 500 }}>No employees found</div>
            <div style={{ fontSize: 13, marginTop: 4, marginBottom: 16 }}>Try adjusting your filters</div>
            {(search || department || status) && (
              <button
                onClick={() => { setSearch(''); setDepartment(null); setStatus(null); }}
                style={{
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                  color: '#10b981', padding: '8px 16px', borderRadius: 8, fontSize: 13,
                  cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {employees.map((emp, idx) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.2 }}
                onClick={() => navigate(`/employees/${emp.id}`)}
                onMouseEnter={() => setHoveredRow(emp.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 1fr 0.6fr',
                  padding: '14px 20px', cursor: 'pointer', alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: hoveredRow === emp.id ? 'rgba(16,185,129,0.04)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                {/* Name + avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <EmpAvatar name={emp.full_name} />
                  <div>
                    <div style={{ color: '#f9fafb', fontSize: 14, fontWeight: 600 }}>{emp.full_name}</div>
                    <div style={{ color: '#4b5563', fontSize: 11, fontFamily: 'monospace', marginTop: 1 }}>
                      #{emp.id ? emp.id.substring(0, 8) : '—'}
                    </div>
                  </div>
                </div>
                <span style={{ color: '#9ca3af', fontSize: 13, fontFamily: 'monospace' }}>{emp.nic || '—'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af', fontSize: 13 }}>
                  <Building2 size={12} style={{ color: '#4b5563' }} /> {emp.department || '—'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af', fontSize: 13 }}>
                  <GitBranch size={12} style={{ color: '#4b5563' }} /> {emp.branch || '—'}
                </div>
                <StatusBadge status={emp.status} />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <ChevronRight size={16} style={{ color: hoveredRow === emp.id ? '#10b981' : '#374151', transition: 'color 0.15s' }} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Footer */}
        {!loading && employees.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#374151', fontSize: 12 }}>{employees.length} employee{employees.length !== 1 ? 's' : ''} shown</span>
          </div>
        )}
      </motion.div>

      <style>{`
        .ant-input { background: transparent !important; color: #f9fafb !important; }
        .ant-input::placeholder { color: #374151 !important; }
        .ant-input-affix-wrapper { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 9px !important; }
        .ant-select-selector { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 9px !important; color: #9ca3af !important; }
        .ant-select-selection-placeholder { color: #4b5563 !important; }
        .ant-select-arrow { color: #4b5563 !important; }
        .dark-select-dropdown .ant-select-item { color: #9ca3af !important; }
        .dark-select-dropdown .ant-select-item-option-active { background: rgba(16,185,129,0.08) !important; }
        .dark-select-dropdown .ant-select-item-option-selected { background: rgba(16,185,129,0.15) !important; color: #10b981 !important; }
      `}</style>
    </div>
  );
};

export default EmployeeDirectory;