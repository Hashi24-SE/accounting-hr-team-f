const supabase = require('../config/supabase');
const bcryptjs = require('bcryptjs');
const { signAccessToken, signRefreshToken } = require('../utils/jwtHelper');
const { hashValue, generateOtp, verifyOtp } = require('../utils/otpHelper');
const env = require('../config/env');
const { sendOtp } = require('./emailService');

const login = async (email, password) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('active', true)
    .single();

  if (error || !user) {
    throw Object.assign(new Error('INVALID_CREDENTIALS'), { code: 'INVALID_CREDENTIALS', status: 401 });
  }

  const isMatch = await bcryptjs.compare(password, user.password_hash);
  if (!isMatch) {
    throw Object.assign(new Error('INVALID_CREDENTIALS'), { code: 'INVALID_CREDENTIALS', status: 401 });
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const rawUuid = signRefreshToken();
  const tokenHash = hashValue(rawUuid);
  
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRY).toISOString();

  const { error: insertError } = await supabase
    .from('refresh_tokens')
    .insert([{ user_id: user.id, token_hash: tokenHash, expires_at: expiresAt }]);

  if (insertError) {
    throw Object.assign(new Error('Failed to create refresh token'), { status: 500 });
  }

  return {
    accessToken,
    refreshToken: rawUuid,
    tokenType: 'Bearer',
    expiresIn: env.JWT_ACCESS_EXPIRY,
    role: user.role,
    email: user.email,
  };
};

const refreshToken = async (rawToken) => {
  const hash = hashValue(rawToken);

  const { data: tokenRecord, error } = await supabase
    .from('refresh_tokens')
    .select('*, users!inner(email, role)')
    .eq('token_hash', hash)
    .eq('revoked', false)
    .single();

  if (error || !tokenRecord) {
    throw Object.assign(new Error('INVALID_TOKEN'), { code: 'INVALID_TOKEN', status: 401 });
  }

  if (new Date(tokenRecord.expires_at) < new Date()) {
    throw Object.assign(new Error('TOKEN_EXPIRED'), { code: 'TOKEN_EXPIRED', status: 401 });
  }

  const { error: updateError } = await supabase
    .from('refresh_tokens')
    .update({ revoked: true })
    .eq('id', tokenRecord.id);

  if (updateError) {
    throw Object.assign(new Error('Failed to revoke old refresh token'), { status: 500 });
  }

  const newAccessToken = signAccessToken({
    userId: tokenRecord.user_id,
    email: tokenRecord.users.email,
    role: tokenRecord.users.role,
  });
  
  const newRawUuid = signRefreshToken();
  const newTokenHash = hashValue(newRawUuid);
  const newExpiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRY).toISOString();

  const { error: insertError } = await supabase
    .from('refresh_tokens')
    .insert([{ user_id: tokenRecord.user_id, token_hash: newTokenHash, expires_at: newExpiresAt }]);

  if (insertError) {
    throw Object.assign(new Error('Failed to create new refresh token'), { status: 500 });
  }

  return {
    accessToken: newAccessToken,
    refreshToken: newRawUuid,
    tokenType: 'Bearer',
    expiresIn: env.JWT_ACCESS_EXPIRY,
    role: tokenRecord.users.role,
    email: tokenRecord.users.email,
  };
};

const logout = async (rawToken) => {
  const hash = hashValue(rawToken);

  await supabase
    .from('refresh_tokens')
    .update({ revoked: true })
    .eq('token_hash', hash);

  return { message: 'Logged out successfully' };
};

const forgotPassword = async (email) => {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (user) {
    const otp = generateOtp();
    const tokenHash = hashValue(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    await supabase
      .from('password_reset_tokens')
      .insert([{ user_id: user.id, token_hash: tokenHash, expires_at: expiresAt }]);

    if (env.APP_EMAIL_ENABLED) {
      await sendOtp(email, otp);
    } else {
      console.log(`[DEV OTP for ${email}]: ${otp}`);
    }
  }
};

const verifyResetOtp = async (email, otp) => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError || !user) {
    throw Object.assign(new Error('INVALID_OTP'), { code: 'INVALID_OTP', status: 400 });
  }

  const { data: tokenRecord, error: tokenError } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('user_id', user.id)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (tokenError || !tokenRecord || new Date(tokenRecord.expires_at) < new Date()) {
    throw Object.assign(new Error('OTP_EXPIRED'), { code: 'OTP_EXPIRED', status: 400 });
  }

  const isValid = verifyOtp(otp, tokenRecord.token_hash);
  if (!isValid) {
    throw Object.assign(new Error('OTP_INVALID'), { code: 'OTP_INVALID', status: 400 });
  }

  return { message: 'OTP verified' };
};

const resetPassword = async (email, otp, newPassword) => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError || !user) {
    throw Object.assign(new Error('INVALID_OTP'), { code: 'INVALID_OTP', status: 400 });
  }

  const { data: tokenRecord, error: tokenError } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('user_id', user.id)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (tokenError || !tokenRecord || new Date(tokenRecord.expires_at) < new Date()) {
    throw Object.assign(new Error('OTP_EXPIRED'), { code: 'OTP_EXPIRED', status: 400 });
  }

  const isValid = verifyOtp(otp, tokenRecord.token_hash);
  if (!isValid) {
    throw Object.assign(new Error('OTP_INVALID'), { code: 'OTP_INVALID', status: 400 });
  }

  const newHash = await bcryptjs.hash(newPassword, 12);

  await supabase
    .from('users')
    .update({ password_hash: newHash })
    .eq('id', user.id);

  await supabase
    .from('password_reset_tokens')
    .update({ used: true })
    .eq('id', tokenRecord.id);

  await supabase
    .from('refresh_tokens')
    .update({ revoked: true })
    .eq('user_id', user.id);

  return { message: 'Password reset successfully' };
};

const getCurrentUser = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, active')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  return data;
};

const createUser = async (email, role, temporaryPassword) => {
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw Object.assign(new Error('DUPLICATE_EMAIL'), { code: 'DUPLICATE_EMAIL', status: 409 });
  }

  const hash = await bcryptjs.hash(temporaryPassword, 12);

  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash: hash, role, active: true }])
    .select('id, email, role, active, email_verified, created_at, updated_at')
    .single();

  if (error) {
    throw Object.assign(new Error('Failed to create user'), { status: 500 });
  }

  return data;
};

module.exports = {
  login,
  refreshToken,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getCurrentUser,
  createUser,
};