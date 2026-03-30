import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, notification } from 'antd';
import { UserOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../../services/api';
import AuthShell from '../../components/layout/AuthShell';

const { Text } = Typography;

/* ─── Main Component ────────────────────────────────────────────────────────── */
const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [tick, setTick] = useState(0);
  const navigate = useNavigate();

  // Live clock for the status bar
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: values.email });
      notification.success({
        title: 'Success',
        description: 'OTP sent to your email!',
        placement: 'topRight',
      });
      navigate('/verify-otp', { state: { email: values.email } });
    } catch (error) {
      notification.error({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send OTP. Please try again.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  /* ── Input wrapper style ── */
  const inputWrap = (field) => ({
    background: focused === field ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${focused === field ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 10,
    transition: 'all 0.25s ease',
    boxShadow: focused === field ? '0 0 0 3px rgba(16,185,129,0.08)' : 'none',
  });

  return (
    <AuthShell>
      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 420, padding: '0 16px', zIndex: 10 }}
      >
        <div
          style={{
            background: 'rgba(8, 22, 15, 0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(16,185,129,0.12)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow:
              '0 0 0 1px rgba(0,0,0,0.4), 0 32px 64px -16px rgba(0,0,0,0.7), 0 0 80px -20px rgba(16,185,129,0.12)',
          }}
        >
          {/* ── Status bar ── */}
          <div
            style={{
              background: 'rgba(16,185,129,0.06)',
              borderBottom: '1px solid rgba(16,185,129,0.1)',
              padding: '8px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                  animation: 'pulse 2s infinite',
                }}
              />
              <Text style={{ color: '#10b981', fontSize: 11, letterSpacing: '0.06em' }}>
                SECURE CONNECTION
              </Text>
            </div>
            <Text style={{ color: '#4b5563', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
              {timeStr}
            </Text>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: '36px 36px 32px' }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{ textAlign: 'center', marginBottom: 32 }}
            >
              <div
                style={{
                  color: '#f9fafb',
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}
              >
                Forgot Password
              </div>
              <div
                style={{
                  color: '#9ca3af',
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                Enter your work email. We'll send you a 6-digit OTP.
              </div>
            </motion.div>

            {/* Form */}
            <Form
              name="forgot-password"
              onFinish={handleSubmit}
              layout="vertical"
              requiredMark={false}
              style={{ gap: 0 }}
            >
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 }}
              >
                <Form.Item
                  name="email"
                  label={
                    <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em' }}>
                      EMAIL ADDRESS
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Enter a valid email' },
                  ]}
                  style={{ marginBottom: 24 }}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: focused === 'email' ? '#10b981' : '#4b5563' }} />}
                    placeholder="admin@greensolutions.tech"
                    disabled={loading}
                    autoFocus
                    size="large"
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    style={{
                      ...inputWrap('email'),
                      color: '#f9fafb',
                      fontSize: 14,
                    }}
                  />
                </Form.Item>
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <Form.Item style={{ marginBottom: 24 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    size="large"
                    icon={!loading && <ArrowRightOutlined />}
                    style={{
                      background: loading
                        ? 'rgba(16,185,129,0.6)'
                        : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      border: 'none',
                      borderRadius: 10,
                      height: 48,
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: '0.01em',
                      boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row-reverse',
                      gap: 8,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {loading ? 'Sending OTP…' : 'Send OTP'}
                  </Button>
                </Form.Item>
              </motion.div>

              {/* Back to Login */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.32 }}
                style={{ textAlign: 'center' }}
              >
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    fontSize: 14,
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'inherit',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#10b981')}
                  onMouseLeave={(e) => (e.target.style.color = '#9ca3af')}
                >
                  <ArrowLeftOutlined style={{ fontSize: 12 }} /> Back to Login
                </button>
              </motion.div>
            </Form>
          </div>

          {/* ── Footer strip ── */}
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              padding: '12px 36px',
              textAlign: 'center',
            }}
          >
            <Text style={{ color: '#374151', fontSize: 11, letterSpacing: '0.04em' }}>
              © {now.getFullYear()} GREEN SOLUTIONS TECH · CONFIDENTIAL
            </Text>
          </div>
        </div>
      </motion.div>

      {/* pulse keyframe */}
    </AuthShell>
  );
};

export default ForgotPasswordPage;