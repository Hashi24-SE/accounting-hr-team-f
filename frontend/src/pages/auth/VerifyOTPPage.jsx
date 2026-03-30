import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Form, Input, Button, Typography, notification, Result } from 'antd';
import { LockOutlined, ArrowLeftOutlined, CheckCircleOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../../services/api';
import AuthShell from '../../components/layout/AuthShell';

const { Text } = Typography;

/* ─── Main Component ────────────────────────────────────────────────────────── */
const VerifyOTPPage = () => {
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [tick, setTick] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Live clock for the status bar
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!email && !success) {
    return <Navigate to="/forgot-password" replace />;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post('/api/auth/verify-otp', {
        email,
        otp: values.otp,
        new_password: values.new_password,
      });
      setSuccess(true);
    } catch (error) {
      notification.error({
        title: 'Error',
        description: error.response?.data?.message || 'Invalid OTP or expired. Please try again.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    try {
      await api.post('/api/auth/resend-otp', { email });
      notification.success({
        title: 'Success',
        description: 'New OTP sent!',
        placement: 'topRight',
      });
      setCooldown(60);
    } catch (error) {
      notification.error({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to resend OTP.',
        placement: 'topRight',
      });
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

  if (success) {
    return (
      <AuthShell>
        <Result
          status="success"
          title={<span style={{ color: '#f9fafb' }}>Email Verified Successfully!</span>}
          subTitle={<span style={{ color: '#9ca3af' }}>Your password has been set. You can now log in.</span>}
          extra={[
            <Button type="primary" key="console" onClick={() => navigate('/login')} size="large" style={{ background: '#10b981', borderColor: '#10b981' }}>
              Go to Login
            </Button>
          ]}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 440, padding: '0 16px', zIndex: 10 }}
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
                Verify Your Account
              </div>
              <div
                style={{
                  color: '#9ca3af',
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                OTP sent to: {email}
              </div>
            </motion.div>

            {/* Form */}
            <Form
              name="verify-otp"
              onFinish={handleSubmit}
              layout="vertical"
              requiredMark={false}
              style={{ gap: 0 }}
            >
              {/* OTP Code */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 }}
              >
                <Form.Item
                  name="otp"
                  label={
                    <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em' }}>
                      6-DIGIT OTP CODE
                    </span>
                  }
                  rules={[
                    { required: true, message: 'OTP is required' },
                    { len: 6, message: 'OTP must be exactly 6 digits' }
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  <Input
                    placeholder="000000"
                    maxLength={6}
                    disabled={loading}
                    autoFocus
                    size="large"
                    onFocus={() => setFocused('otp')}
                    onBlur={() => setFocused(null)}
                    style={{
                      ...inputWrap('otp'),
                      color: '#10b981',
                      fontSize: 28,
                      letterSpacing: '0.5em',
                      textAlign: 'center',
                      fontWeight: 600,
                      padding: '12px 0'
                    }}
                  />
                </Form.Item>
              </motion.div>

              {/* New Password */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.26 }}
              >
                <Form.Item
                  name="new_password"
                  label={
                    <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em' }}>
                      NEW PASSWORD
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Password is required' },
                    { min: 8, message: 'Password must be at least 8 characters long' }
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: focused === 'new_password' ? '#10b981' : '#4b5563' }} />}
                    placeholder="••••••••"
                    disabled={loading}
                    size="large"
                    onFocus={() => setFocused('new_password')}
                    onBlur={() => setFocused(null)}
                    iconRender={(visible) =>
                      visible ? (
                        <EyeTwoTone twoToneColor="#10b981" />
                      ) : (
                        <EyeInvisibleOutlined style={{ color: '#4b5563' }} />
                      )
                    }
                    style={{
                      ...inputWrap('new_password'),
                      color: '#f9fafb',
                      fontSize: 14,
                    }}
                  />
                </Form.Item>
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.30 }}
              >
                <Form.Item
                  name="confirm_password"
                  label={
                    <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em' }}>
                      CONFIRM PASSWORD
                    </span>
                  }
                  dependencies={['new_password']}
                  rules={[
                    { required: true, message: 'Please confirm your password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('new_password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                  style={{ marginBottom: 28 }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: focused === 'confirm_password' ? '#10b981' : '#4b5563' }} />}
                    placeholder="••••••••"
                    disabled={loading}
                    size="large"
                    onFocus={() => setFocused('confirm_password')}
                    onBlur={() => setFocused(null)}
                    iconRender={(visible) =>
                      visible ? (
                        <EyeTwoTone twoToneColor="#10b981" />
                      ) : (
                        <EyeInvisibleOutlined style={{ color: '#4b5563' }} />
                      )
                    }
                    style={{
                      ...inputWrap('confirm_password'),
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
                transition={{ delay: 0.34 }}
              >
                <Form.Item style={{ marginBottom: 20 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    size="large"
                    icon={!loading && <CheckCircleOutlined />}
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
                      gap: 8,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {loading ? 'Verifying…' : 'Verify & Set Password'}
                  </Button>
                </Form.Item>
              </motion.div>
              
              {/* Resend OTP */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38 }}
                style={{ textAlign: 'center', marginBottom: 16 }}
              >
                {cooldown > 0 ? (
                  <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                    Resend in 00:{cooldown < 10 ? `0${cooldown}` : cooldown}
                  </Text>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#10b981',
                      fontSize: 13,
                      cursor: 'pointer',
                      padding: 0,
                      fontFamily: 'inherit',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    Didn't receive it? Resend OTP
                  </button>
                )}
              </motion.div>

              {/* Back Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42 }}
                style={{ textAlign: 'center' }}
              >
                <button
                  type="button"
                  onClick={() => navigate(-1)}
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
                  <ArrowLeftOutlined style={{ fontSize: 12 }} /> Back
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

export default VerifyOTPPage;