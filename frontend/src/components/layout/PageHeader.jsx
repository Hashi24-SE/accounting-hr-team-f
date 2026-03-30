import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, icon: Icon, actions, breadcrumb }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ marginBottom: 24 }}
    >
      {breadcrumb && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          {breadcrumb}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1
            style={{
              color: '#f9fafb',
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {Icon && <Icon size={22} style={{ color: '#10b981' }} />}
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: '#4b5563', fontSize: 13, margin: '4px 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div style={{ display: 'flex', gap: 12 }}>{actions}</div>}
      </div>
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, rgba(16,185,129,0.2), transparent)',
          marginTop: 16,
        }}
      />
    </motion.div>
  );
};

export default PageHeader;
