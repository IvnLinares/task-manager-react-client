import React, { useState, useEffect, useRef } from 'react';
import { Container, Spinner, Alert, Badge } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, CalendarDays, Edit2, X, Paperclip, Calendar, Images, Tag, AlignLeft, Image } from 'lucide-react';
import { getTasks } from '../services/tasks';
import TaskModal from '../components/TaskModal';
import { getAttachmentUrl, isImage } from '../utils/attachmentUtils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const getPriorityPillClass = (priority) => {
  switch(priority) {
    case 'high': return 'cal-pill-high';
    case 'medium': return 'cal-pill-medium';
    case 'low': return 'cal-pill-low';
    default: return 'cal-pill-default';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'todo': return 'pill-todo';
    case 'in_progress': return 'pill-progress';
    case 'done': return 'pill-done';
    default: return '';
  }
};

// ─── Task Preview Popover ──────────────────────────────────────────────────────
const TaskPreviewCard = ({ task, onEdit, onClose, onLightbox }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const imageAtts = task.attachments?.filter(a => isImage(a.filename)) || [];
  const fileAtts  = task.attachments?.filter(a => !isImage(a.filename)) || [];
  const hasAttachments = imageAtts.length > 0 || fileAtts.length > 0;

  return (
    <div className="cal-preview-card" ref={ref}>

      {/* ── Top bar: title + actions ───────────────────────── */}
      <div className="cal-preview-topbar">
        <span className="cal-preview-title">{task.title}</span>
        <div className="cal-preview-actions">
          <button className="cal-preview-icon-btn cal-preview-edit-btn" onClick={onEdit} title="Edit Task">
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
          <button className="cal-preview-icon-btn" onClick={onClose} title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Two-column body ────────────────────────────────── */}
      <div className={`cal-preview-body ${!hasAttachments ? 'cal-preview-body--single' : ''}`}>

        {/* LEFT — task metadata */}
        <div className="cal-preview-left">

          {/* Badges */}
          <div className="cal-preview-row">
            <Badge bg="transparent" className={`glass-pill ${getPriorityPillClass(task.priority)}`}>
              {task.priority?.toUpperCase() || 'NORMAL'}
            </Badge>
            <Badge bg="transparent" className={`glass-pill ${getStatusClass(task.status)}`}>
              {task.status?.replace('_', ' ').toUpperCase() || 'TODO'}
            </Badge>
          </div>

          {/* Due date */}
          {task.due_date && (
            <div className="cal-preview-meta-row">
              <Calendar size={13} className="cal-preview-meta-icon" />
              <span className="cal-preview-meta-text">
                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className="cal-preview-meta-row cal-preview-meta-row--top">
              <AlignLeft size={13} className="cal-preview-meta-icon" style={{ marginTop: 3 }} />
              <p className="cal-preview-desc">{task.description}</p>
            </div>
          )}

          {/* Categories */}
          {task.categories?.length > 0 && (
            <div className="cal-preview-meta-row">
              <Tag size={13} className="cal-preview-meta-icon" />
              <div className="d-flex flex-wrap gap-1">
                {task.categories.map(cat => (
                  <span key={cat.id} className="cal-preview-cat-pill">{cat.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — attachments (only rendered when there are files) */}
        {hasAttachments && (
          <div className="cal-preview-right">
            <div className="cal-preview-section-label">
              <Images size={12} />
              <span>Attachments</span>
            </div>

            {/* Image thumbnails */}
            {imageAtts.length > 0 && (
              <div className="cal-preview-images">
                {imageAtts.map(att => {
                  const url = getAttachmentUrl(task.id, att.filename);
                  return (
                    <button
                      key={att.id}
                      className="att-thumb-btn cal-preview-thumb"
                      onClick={() => onLightbox(url)}
                      title={att.filename}
                    >
                      <img src={url} alt={att.filename} className="att-thumb" />
                      <span className="att-thumb-overlay">
                        <Image size={14} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Non-image files */}
            {fileAtts.length > 0 && (
              <div className="cal-preview-files">
                {fileAtts.map(att => (
                  <span key={att.id} className="cal-preview-file-pill">
                    <Paperclip size={10} />
                    {att.filename}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


// ─── Main Page ─────────────────────────────────────────────────────────────────
const CalendarPage = () => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Preview card state
  const [previewTask, setPreviewTask] = useState(null);

  // Edit modal state
  const [editingTask, setEditingTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Lightbox state
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTasks();
      setTasks(data);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // Group tasks by date string "YYYY-MM-DD"
  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.due_date) {
      const key = task.due_date.split('T')[0];
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
    }
    return acc;
  }, {});

  const unscheduled = tasks.filter(t => !t.due_date);

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, thisMonth: false, date: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, thisMonth: true, date: dateStr });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, thisMonth: false, date: null });
    }
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const openPreview = (task) => setPreviewTask(task);
  const openEdit = (task) => {
    setPreviewTask(null);
    setEditingTask(task);
    setShowModal(true);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  return (
    <Container fluid className="py-2" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <CalendarDays size={22} style={{ color: 'var(--text-primary)' }} />
          <h2 className="mb-0">Calendar</h2>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button className="cal-nav-btn" onClick={prevMonth} title="Previous month">
            <ChevronLeft size={18} />
          </button>
          <span className="cal-month-label">{MONTHS[viewMonth]} {viewYear}</span>
          <button className="cal-nav-btn" onClick={nextMonth} title="Next month">
            <ChevronRight size={18} />
          </button>
          <button
            className="cal-today-btn"
            onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}
          >
            Today
          </button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center mt-5"><Spinner animation="border" /></div>
      ) : (
        <>
          {/* Calendar Grid */}
          <div className="cal-grid-wrapper">
            <div className="cal-grid">
              {WEEKDAYS.map(d => (
                <div key={d} className="cal-weekday-header">{d}</div>
              ))}

              {cells.map((cell, idx) => {
                const cellTasks = cell.date ? (tasksByDate[cell.date] || []) : [];
                const isToday = cell.date === todayStr;
                const MAX_VISIBLE = 3;
                const overflow = cellTasks.length - MAX_VISIBLE;

                return (
                  <div
                    key={idx}
                    className={[
                      'cal-day',
                      !cell.thisMonth && 'cal-day--other-month',
                      isToday && 'cal-day--today',
                    ].filter(Boolean).join(' ')}
                  >
                    <span className={`cal-day-number ${isToday ? 'cal-day-number--today' : ''}`}>
                      {cell.day}
                    </span>

                    <div className="cal-tasks-list">
                      {cellTasks.slice(0, MAX_VISIBLE).map(task => (
                        <button
                          key={task.id}
                          className={`cal-task-pill ${getPriorityPillClass(task.priority)}`}
                          onClick={() => openPreview(task)}
                          title={task.title}
                        >
                          <span className="cal-task-pill-dot" />
                          <span className="cal-task-pill-text">{task.title}</span>
                          {task.attachments?.some(a => isImage(a.filename)) && (
                            <span className="cal-task-pill-img-badge" title="Has images">🖼</span>
                          )}
                        </button>
                      ))}
                      {overflow > 0 && (
                        <span className="cal-overflow-badge">+{overflow} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unscheduled section */}
          {unscheduled.length > 0 && (
            <div className="mt-4 cal-unscheduled">
              <h6 className="cal-section-label">Unscheduled</h6>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {unscheduled.map(task => (
                  <button
                    key={task.id}
                    className={`cal-task-pill cal-task-pill--lg ${getPriorityPillClass(task.priority)}`}
                    onClick={() => openPreview(task)}
                    title={task.title}
                  >
                    <span className="cal-task-pill-dot" />
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Task Preview Popover */}
      {previewTask && (
        <div className="cal-preview-overlay">
          <TaskPreviewCard
            task={previewTask}
            onEdit={() => openEdit(previewTask)}
            onClose={() => setPreviewTask(null)}
            onLightbox={setLightboxSrc}
          />
        </div>
      )}

      {/* Lightbox */}
      {lightboxSrc && (
        <div className="att-lightbox" onClick={() => setLightboxSrc(null)}>
          <button className="att-lightbox-close" onClick={() => setLightboxSrc(null)}>
            <X size={22} />
          </button>
          <img
            src={lightboxSrc}
            alt="Preview"
            className="att-lightbox-img"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <TaskModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        refreshTasks={fetchTasks}
        editingTask={editingTask}
      />
    </Container>
  );
};

export default CalendarPage;
