import React from 'react';

const STATUS_CFG = {
  Active: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', glow: '#10b981' },
  Inactive: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', glow: '#f87171' },
  'On Leave': { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', glow: '#fbbf24' },
  Suspended: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', glow: '#94a3b8' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.Suspended;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        borderRadius: 20,
        padding: '3px 10px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: cfg.color,
          boxShadow: `0 0 5px ${cfg.glow || cfg.color}`,
        }}
      />
      {(status || 'Active').toUpperCase()}
    </span>
  );
};

export default StatusBadge;
