// Demo mode: no backend — attachment URLs are unused (all tasks have empty attachments)
const API_BASE = '';

export const getAttachmentUrl = (taskId, filename) =>
  `${API_BASE}/uploads/${taskId}_${filename}`;

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'];

export const isImage = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  return IMAGE_EXTS.includes(ext);
};
