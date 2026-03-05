import api from './api';

export const loginAPI = async (email, password) => {
  const params = new URLSearchParams();
  params.append('username', email); // OAuth2 requires username field
  params.append('password', password);
  
  const response = await api.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

export const registerAPI = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};
