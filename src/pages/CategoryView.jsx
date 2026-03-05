import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Badge } from 'react-bootstrap';
import { Tag, Edit2, Trash2, Upload, Plus, Inbox } from 'lucide-react';
import { getTasks, deleteTask } from '../services/tasks';
import { getCategories } from '../services/categories';
import TaskModal from '../components/TaskModal';
import UploadModal from '../components/UploadModal';

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'high': return 'pill-high';
    case 'medium': return 'pill-medium';
    case 'low': return 'pill-low';
    default: return '';
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

// A palette of subtle accent colors for category headers
const CATEGORY_ACCENTS = [
  { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.35)', dot: '#a78bfa' },
  { bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.35)',  dot: '#60a5fa' },
  { bg: 'rgba(52,211,153,0.15)',  border: 'rgba(52,211,153,0.35)',  dot: '#34d399' },
  { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.35)',  dot: '#fbbf24' },
  { bg: 'rgba(251,113,133,0.15)', border: 'rgba(251,113,133,0.35)', dot: '#fb7185' },
  { bg: 'rgba(34,211,238,0.15)',  border: 'rgba(34,211,238,0.35)',  dot: '#22d3ee' },
];

const CategoryView = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadTaskId, setUploadTaskId] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksData, catsData] = await Promise.all([getTasks(), getCategories()]);
      setTasks(tasksData);
      setCategories(catsData);
      // Start all expanded
      const expanded = {};
      catsData.forEach(c => { expanded[c.id] = true; });
      expanded['__uncategorized__'] = true;
      setExpandedCats(expanded);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      try { await deleteTask(id); fetchAll(); } catch { setError('Failed to delete.'); }
    }
  };

  const toggleCat = (id) => setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));

  // Group tasks by category
  // A task can appear in multiple categories
  const grouped = {};
  categories.forEach(cat => { grouped[cat.id] = { cat, tasks: [] }; });
  const uncategorized = [];

  tasks.forEach(task => {
    if (!task.categories || task.categories.length === 0) {
      uncategorized.push(task);
    } else {
      task.categories.forEach(cat => {
        if (grouped[cat.id]) grouped[cat.id].tasks.push(task);
      });
    }
  });

  const groups = Object.values(grouped);

  return (
    <Container fluid className="py-2">
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <Tag size={22} style={{ color: 'var(--text-primary)' }} />
        <h2 className="mb-0">By Category</h2>
        <span className="catview-count-badge ms-1">{tasks.length} tasks</span>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center mt-5"><Spinner animation="border" /></div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {/* Category groups */}
          {groups.map((group, idx) => {
            const accent = CATEGORY_ACCENTS[idx % CATEGORY_ACCENTS.length];
            const isOpen = expandedCats[group.cat.id];
            return (
              <div key={group.cat.id} className="catview-group">
                {/* Group Header */}
                <button
                  className="catview-group-header"
                  style={{ '--accent-bg': accent.bg, '--accent-border': accent.border }}
                  onClick={() => toggleCat(group.cat.id)}
                >
                  <span className="catview-dot" style={{ background: accent.dot }} />
                  <span className="catview-group-name">{group.cat.name}</span>
                  <span className="catview-group-count">{group.tasks.length}</span>
                  <span className={`catview-chevron ${isOpen ? 'open' : ''}`}>›</span>
                </button>

                {/* Task rows */}
                {isOpen && (
                  <div className="catview-task-list">
                    {group.tasks.length === 0 ? (
                      <div className="catview-empty">No tasks in this category.</div>
                    ) : (
                      group.tasks.map(task => (
                        <div key={task.id} className="catview-task-row">
                          <div className="catview-task-main">
                            <span className="catview-task-title">{task.title}</span>
                            {task.description && (
                              <span className="catview-task-desc">{task.description}</span>
                            )}
                          </div>
                          <div className="catview-task-meta">
                            {task.due_date && (
                              <span className="catview-due">
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                            <Badge bg="transparent" className={`glass-pill ${getPriorityClass(task.priority)}`}>
                              {task.priority?.toUpperCase() || 'NORMAL'}
                            </Badge>
                            <Badge bg="transparent" className={`glass-pill ${getStatusClass(task.status)}`}>
                              {task.status?.replace('_', ' ').toUpperCase() || 'TODO'}
                            </Badge>
                          </div>
                          <div className="catview-task-actions">
                            <button
                              className="catview-icon-btn"
                              onClick={() => { setUploadTaskId(task.id); setShowUpload(true); }}
                              title="Upload"
                            >
                              <Upload size={14} />
                            </button>
                            <button
                              className="catview-icon-btn"
                              onClick={() => { setEditingTask(task); setShowModal(true); }}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="catview-icon-btn catview-icon-btn--danger"
                              onClick={() => handleDelete(task.id)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Uncategorized group */}
          {uncategorized.length > 0 && (
            <div className="catview-group">
              <button
                className="catview-group-header"
                style={{ '--accent-bg': 'rgba(156,163,175,0.1)', '--accent-border': 'rgba(156,163,175,0.25)' }}
                onClick={() => toggleCat('__uncategorized__')}
              >
                <Inbox size={14} style={{ color: 'var(--text-secondary)' }} />
                <span className="catview-group-name" style={{ color: 'var(--text-secondary)' }}>Uncategorized</span>
                <span className="catview-group-count">{uncategorized.length}</span>
                <span className={`catview-chevron ${expandedCats['__uncategorized__'] ? 'open' : ''}`}>›</span>
              </button>

              {expandedCats['__uncategorized__'] && (
                <div className="catview-task-list">
                  {uncategorized.map(task => (
                    <div key={task.id} className="catview-task-row">
                      <div className="catview-task-main">
                        <span className="catview-task-title">{task.title}</span>
                        {task.description && (
                          <span className="catview-task-desc">{task.description}</span>
                        )}
                      </div>
                      <div className="catview-task-meta">
                        {task.due_date && (
                          <span className="catview-due">
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <Badge bg="transparent" className={`glass-pill ${getPriorityClass(task.priority)}`}>
                          {task.priority?.toUpperCase() || 'NORMAL'}
                        </Badge>
                        <Badge bg="transparent" className={`glass-pill ${getStatusClass(task.status)}`}>
                          {task.status?.replace('_', ' ').toUpperCase() || 'TODO'}
                        </Badge>
                      </div>
                      <div className="catview-task-actions">
                        <button
                          className="catview-icon-btn"
                          onClick={() => { setUploadTaskId(task.id); setShowUpload(true); }}
                          title="Upload"
                        >
                          <Upload size={14} />
                        </button>
                        <button
                          className="catview-icon-btn"
                          onClick={() => { setEditingTask(task); setShowModal(true); }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="catview-icon-btn catview-icon-btn--danger"
                          onClick={() => handleDelete(task.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {groups.length === 0 && uncategorized.length === 0 && (
            <div className="text-center text-muted mt-5">No tasks found.</div>
          )}
        </div>
      )}

      <TaskModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        refreshTasks={fetchAll}
        editingTask={editingTask}
      />
      <UploadModal
        show={showUpload}
        handleClose={() => setShowUpload(false)}
        taskId={uploadTaskId}
        refreshTasks={fetchAll}
      />
    </Container>
  );
};

export default CategoryView;
