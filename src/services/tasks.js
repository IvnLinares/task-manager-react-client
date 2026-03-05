// Demo mode: all calls return in-memory mock data (no backend required)
import {
  mockGetTasks,
  mockGetTaskById,
  mockCreateTask,
  mockUpdateTask,
  mockDeleteTask,
  mockUploadAttachment,
} from './mockData';

export const getTasks        = (params = {}) => mockGetTasks(params);
export const getTaskById     = (id)          => mockGetTaskById(id);
export const createTask      = (data)        => mockCreateTask(data);
export const updateTask      = (id, data)    => mockUpdateTask(id, data);
export const deleteTask      = (id)          => mockDeleteTask(id);
export const uploadAttachment= (id, form)    => mockUploadAttachment(id, form);
