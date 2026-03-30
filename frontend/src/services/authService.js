import axios from 'axios';

export const getAccessToken = () => localStorage.getItem('accessToken');

export const setAccessToken = (token) => {
  localStorage.setItem('accessToken', token);
};

export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const isAuthenticated = () => {
  return !!getAccessToken() || !!getRefreshToken();
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    
    if (response.data.success && response.data.data) {
      const { accessToken: newAccessToken, refreshToken } = response.data.data;
      setAccessToken(newAccessToken);
      setRefreshToken(refreshToken);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Login failed');
  }
};

export const logout = async () => {
  try {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    if (accessToken && refreshToken) {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`,
        { refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }
  } catch (error) {
    console.error('Logout API call failed', error);
  } finally {
    clearTokens();
  }
};

export const fetchCurrentUser = async () => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('No access token available');
  }
  
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch current user');
  }
};
