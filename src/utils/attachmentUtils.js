/**
 * Returns the public URL for an attachment served by the backend.
 * Files are stored as: uploads/{task_id}_{filename}
 */
const API_BASE = 'http://localhost:8000';

export const getAttachmentUrl = (taskId, filename) =>
  `${API_BASE}/uploads/${taskId}_${filename}`;

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'];

export const isImage = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  return IMAGE_EXTS.includes(ext);
};
