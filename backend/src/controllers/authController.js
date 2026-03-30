const authService = require("../services/authService");
const { success } = require("../utils/response");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    return success(res, data, "Login successful", 200);
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const data = await authService.refreshToken(refreshToken);
    return success(res, data, "Token refreshed successfully", 200);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const data = await authService.logout(refreshToken);
    return success(res, data, "Logged out successfully", 200);
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const data = await authService.getCurrentUser(
      req.user.id || req.user.userId,
    );
    return success(res, data, "User details fetched successfully", 200);
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    // Always return 200 to prevent email enumeration
    return success(
      res,
      null,
      "If that email exists, a reset code has been sent",
      200,
    );
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const data = await authService.verifyResetOtp(email, otp);
    return success(res, data, "OTP verified", 200);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const data = await authService.resetPassword(email, otp, newPassword);
    return success(res, data, "Password reset successfully", 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
