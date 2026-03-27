import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // Note: api interceptor already unpacks `response.data` so this may just be `return response.data;` assuming api returns the axios object. Since we wrote `return response.data` in the interceptor, this will actually be `return await api.post...` but we'll adapt.
};
