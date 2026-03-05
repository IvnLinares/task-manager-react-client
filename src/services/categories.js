// Demo mode: all calls return in-memory mock data (no backend required)
import {
  mockGetCategories,
  mockCreateCategory,
  mockGetCategoryById,
} from './mockData';

export const getCategories    = ()     => mockGetCategories();
export const createCategory   = (data) => mockCreateCategory(data);
export const getCategoryById  = (id)   => mockGetCategoryById(id);
