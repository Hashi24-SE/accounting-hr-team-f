import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined, CheckCircleOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { logout } from '../../services/authService';

const { Title, Text } = Typography;

/* ─── Main Component ────────────────────────────────────────────────────────── */
const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        current_password: values.current_password,
        new_password: values.new_password,
      });
      message.success('Password updated successfully!');
      await logout();
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.message || 'Current password is incorrect or failed to update.');
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        width: '100%',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 440 }}
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
          {/* ── Body ── */}
          <div style={{ padding: '36px 36px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={3} style={{ color: '#f9fafb', margin: 0 }}>
                Change Password
              </Title>
              <Text style={{ color: '#9ca3af' }}>
                Update your account password securely.
              </Text>
            </div>

            {/* Form */}
            <Form
              name="reset-password"
              onFinish={handleSubmit}
              layout="vertical"
              requiredMark={false}
              style={{ gap: 0 }}
            >
              {/* Current Password */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Form.Item
                  name="current_password"
                  label={
                    <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em' }}>
                      CURRENT PASSWORD
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Current password is required' }
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: focused === 'current_password' ? '#10b981' : '#4b5563' }} />}
                    placeholder="••••••••"
                    disabled={loading}
                    autoFocus
                    size="large"
                    onFocus={() => setFocused('current_password')}
                    onBlur={() => setFocused(null)}
                    iconRender={(visible) =>
                      visible ? (
                        <EyeTwoTone twoToneColor="#10b981" />
                      ) : (
                        <EyeInvisibleOutlined style={{ color: '#4b5563' }} />
                      )
                    }
                    style={{
                      ...inputWrap('current_password'),
                      color: '#f9fafb',
                      fontSize: 14,
                    }}
                  />
                </Form.Item>
              </motion.div>

              {/* New Password */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Form.Item
                  name="new_password"
                  label={
                    <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em' }}>
                      NEW PASSWORD
                    </span>
                  }
                  rules={[
                    { required: true, message: 'New password is required' },
                    { min: 8, message: 'Password must be at least 8 characters long' },
                    {
                      pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
                      message: 'Password must contain uppercase, lowercase, and number',
                    }
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
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Form.Item
                  name="confirm_password"
                  label={
                    <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em' }}>
                      CONFIRM NEW PASSWORD
                    </span>
                  }
                  dependencies={['new_password']}
                  rules={[
                    { required: true, message: 'Please confirm your new password' },
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

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ display: 'flex', gap: 12 }}
              >
                <Button
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  size="large"
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#f9fafb',
                    borderRadius: 10,
                    height: 48,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  icon={!loading && <CheckCircleOutlined />}
                  style={{
                    flex: 2,
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
                    transition: 'all 0.25s ease',
                  }}
                >
                  {loading ? 'Updating…' : 'Update Password'}
                </Button>
              </motion.div>
            </Form>
          </div>
        </div>
      </motion.div>

      <style>{`
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

export default ResetPasswordPage;