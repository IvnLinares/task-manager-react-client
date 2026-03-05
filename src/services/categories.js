import api from './api';

export const getCategories = async (skip = 0, limit = 100) => {
  const response = await api.get('/categories/', { params: { skip, limit } });
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/categories/', categoryData);
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};
