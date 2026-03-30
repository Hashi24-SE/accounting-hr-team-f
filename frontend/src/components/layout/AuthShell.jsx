import React from 'react';

/* ─── Floating Orb ─────────────────────────────────────────────────────────── */
const Orb = ({ style }) => (
  <div
    style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: 0.18,
      pointerEvents: 'none',
      ...style,
    }}
  />
);

/* ─── Animated grid lines ───────────────────────────────────────────────────── */
const GridOverlay = () => (
  <svg
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity: 0.04,
      pointerEvents: 'none',
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#10b981" strokeWidth="0.8" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

const AuthShell = ({ children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050f0a',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Background atmosphere ── */}
      <GridOverlay />
      <Orb style={{ width: 520, height: 520, background: '#064e3b', top: -120, left: -160 }} />
      <Orb style={{ width: 400, height: 400, background: '#10b981', bottom: -80, right: -100 }} />
      <Orb style={{ width: 300, height: 300, background: '#059669', top: '40%', left: '60%' }} />

      {/* ── Content ── */}
      {children}

      {/* pulse keyframe globally available for auth forms */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .ant-input, .ant-input-affix-wrapper {
          background: transparent !important;
          color: #f9fafb !important;
        }
        .ant-input::placeholder { color: #4b5563 !important; }
        .ant-input-affix-wrapper:hover { border-color: rgba(16,185,129,0.4) !important; }
        .ant-form-item-explain-error { color: #f87171 !important; font-size: 12px; }
      `}</style>
    </div>
  );
};

export default AuthShell;
