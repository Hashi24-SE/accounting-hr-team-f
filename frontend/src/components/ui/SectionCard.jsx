import React from 'react';
import { motion } from 'framer-motion';

const SectionCard = ({ children, delay = 0, style, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={className}
      style={{
        background: 'rgba(8,20,13,0.85)',
        border: '1px solid rgba(16,185,129,0.12)',
        borderRadius: 18,
        padding: '32px 36px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
};

export default SectionCard;
