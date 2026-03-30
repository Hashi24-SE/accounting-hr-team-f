import React, { useState, useEffect } from 'react';
import { Avatar, Dropdown, Tooltip } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Bell,
  Search,
} from 'lucide-react';
import { logout } from '../../services/authService';
import NotificationBell from '../notifications/NotificationBell';

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const SIDEBAR_W = 240;
const SIDEBAR_W_COLLAPSED = 68;

const NAV_ITEMS = [
  { key: '/employees',     icon: Users,          label: 'Directory',          group: 'main' },
  { key: '/employees/new', icon: UserPlus,        label: 'Register Employee',  group: 'main' },
  { key: '/settings',      icon: Settings,        label: 'Settings',           group: 'system' },
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const resolveKey = (pathname) => {
  if (pathname.startsWith('/employees/new')) return '/employees/new';
  if (pathname.startsWith('/employees'))     return '/employees';
  if (pathname.startsWith('/settings'))      return '/settings';
  return '';
};

/* ─────────────────────────────────────────────
   NavItem
───────────────────────────────────────────── */
const NavItem = ({ item, active, collapsed, onClick }) => {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);

  const content = (
    <motion.button
      onClick={() => onClick(item.key)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: collapsed ? '10px 0' : '10px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        background: active
          ? 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.08) 100%)'
          : hovered
          ? 'rgba(255,255,255,0.04)'
          : 'transparent',
        transition: 'background 0.2s ease',
        fontFamily: 'inherit',
      }}
    >
      {/* Active left bar */}
      {active && (
        <motion.div
          layoutId="activeBar"
          style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            height: '60%',
            width: 3,
            borderRadius: '0 3px 3px 0',
            background: '#10b981',
            boxShadow: '0 0 8px rgba(16,185,129,0.6)',
          }}
        />
      )}

      {/* Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 9,
          flexShrink: 0,
          background: active
            ? 'rgba(16,185,129,0.2)'
            : hovered
            ? 'rgba(255,255,255,0.06)'
            : 'transparent',
          transition: 'background 0.2s',
        }}
      >
        <Icon
          size={18}
          style={{
            color: active ? '#10b981' : hovered ? '#d1fae5' : '#6b7280',
            transition: 'color 0.2s',
          }}
        />
      </div>

      {/* Label */}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18 }}
            style={{
              fontSize: 13.5,
              fontWeight: active ? 600 : 400,
              color: active ? '#d1fae5' : '#9ca3af',
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
            }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );

  return collapsed ? (
    <Tooltip title={item.label} placement="right">
      {content}
    </Tooltip>
  ) : content;
};

/* ─────────────────────────────────────────────
   Main Layout
───────────────────────────────────────────── */
const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const activeKey = resolveKey(location.pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = {
    items: [
      {
        key: 'settings',
        label: 'Settings',
        icon: <Settings size={14} />,
        onClick: () => navigate('/settings'),
      },
      { type: 'divider' },
      {
        key: 'logout',
        label: 'Sign out',
        icon: <LogOut size={14} />,
        onClick: handleLogout,
        danger: true,
      },
    ],
  };

  const mainItems   = NAV_ITEMS.filter((i) => i.group === 'main');
  const systemItems = NAV_ITEMS.filter((i) => i.group === 'system');

  const sidebarWidth = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060d08', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(6, 15, 10, 0.97)',
          borderRight: '1px solid rgba(16,185,129,0.1)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0' : '0 16px 0 18px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            flexShrink: 0,
          }}
        >
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div
                  style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: 'linear-gradient(135deg, #065f46, #10b981)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                  }}
                >
                  🌿
                </div>
                <div>
                  <div style={{ color: '#ecfdf5', fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                    Green Solutions
                  </div>
                  <div style={{ color: '#4b5563', fontSize: 10.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    HR Payroll
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: 'linear-gradient(135deg, #065f46, #10b981)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                🌿
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse toggle */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 7,
                width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#6b7280',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
          {/* Main group */}
          {!collapsed && (
            <div style={{ color: '#374151', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 6px 6px', marginBottom: 2 }}>
              Main
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {mainItems.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                active={activeKey === item.key}
                collapsed={collapsed}
                onClick={(key) => navigate(key)}
              />
            ))}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '14px 0' }} />

          {/* System group */}
          {!collapsed && (
            <div style={{ color: '#374151', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 6px 6px', marginBottom: 2 }}>
              System
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {systemItems.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                active={activeKey === item.key}
                collapsed={collapsed}
                onClick={(key) => navigate(key)}
              />
            ))}
          </div>
        </nav>

        {/* User profile strip */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: collapsed ? '12px 0' : '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <Dropdown menu={userMenuItems} placement="topRight" trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', width: '100%' }}>
              <Avatar
                size={36}
                style={{
                  background: 'linear-gradient(135deg, #065f46, #10b981)',
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
                }}
              >
                AD
              </Avatar>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ overflow: 'hidden', minWidth: 0 }}
                  >
                    <div style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Admin User
                    </div>
                    <div style={{ color: '#4b5563', fontSize: 11, whiteSpace: 'nowrap' }}>
                      System Administrator
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Dropdown>
        </div>

        {/* Collapsed expand button */}
        {collapsed && (
          <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.15)',
                borderRadius: 8,
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#10b981',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </motion.aside>

      {/* ── MAIN AREA ── */}
      <motion.div
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        {/* Header */}
        <header
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: 'rgba(6, 13, 9, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(16,185,129,0.07)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          {/* Left — breadcrumb / page name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#e5e7eb', fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
                {activeKey === '/employees'     && 'Employee Directory'}
                {activeKey === '/employees/new' && 'Register Employee'}
                {activeKey === '/settings'      && 'Settings'}
                {!activeKey                     && 'Dashboard'}
              </span>
              <span style={{ color: '#374151', fontSize: 11, letterSpacing: '0.03em' }}>
                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Right — actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search hint */}
            <Tooltip title="Search (coming soon)" placement="bottom">
              <button
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 9,
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#6b7280',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#9ca3af'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#6b7280'; }}
              >
                <Search size={15} />
              </button>
            </Tooltip>

            {/* Notifications */}
            <NotificationBell />

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.07)', margin: '0 4px' }} />

            {/* Avatar dropdown */}
            <Dropdown menu={userMenuItems} placement="bottomRight" trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 9, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Avatar
                  size={32}
                  style={{
                    background: 'linear-gradient(135deg, #065f46, #10b981)',
                    fontSize: 12, fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
                  }}
                >
                  AD
                </Avatar>
                <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500 }} className="hidden sm:block">
                  Admin
                </span>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            padding: '28px 28px',
            background: '#060d08',
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.05) 0%, transparent 60%),
              radial-gradient(ellipse 40% 40% at 90% 80%, rgba(6,95,70,0.06) 0%, transparent 50%)
            `,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.35); }
        .ant-dropdown-menu {
          background: rgba(8, 20, 12, 0.95) !important;
          border: 1px solid rgba(16,185,129,0.12) !important;
          backdrop-filter: blur(16px) !important;
        }
        .ant-dropdown-menu-item { color: #9ca3af !important; }
        .ant-dropdown-menu-item:hover { background: rgba(255,255,255,0.05) !important; color: #e5e7eb !important; }
        .ant-dropdown-menu-item-danger { color: #f87171 !important; }
        .ant-dropdown-menu-item-danger:hover { background: rgba(239,68,68,0.1) !important; }
        .ant-tooltip-inner { background: rgba(8,20,12,0.95) !important; border: 1px solid rgba(16,185,129,0.15) !important; color: #d1fae5 !important; font-size: 12px !important; }
        .ant-tooltip-arrow::before { background: rgba(8,20,12,0.95) !important; }
      `}</style>
    </div>
  );
};

export default AppLayout;