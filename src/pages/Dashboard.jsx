import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button, Form } from 'react-bootstrap';
import { Edit2, Trash2, Upload, Plus, Settings, X } from 'lucide-react';
import { getTasks, deleteTask } from '../services/tasks';
import TaskModal from '../components/TaskModal';
import CategorySidebar from '../components/CategorySidebar';
import UploadModal from '../components/UploadModal';
import { getAttachmentUrl, isImage } from '../utils/attachmentUtils';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [showCategories, setShowCategories] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [uploadTaskId, setUploadTaskId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [lightboxSrc, setLightboxSrc] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (priorityFilter) params.priority = priorityFilter;

      const data = await getTasks(params);
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [priorityFilter]); // Search will be triggered manually via form submit

  const handleShowNewTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleShowUpload = (id) => {
    setUploadTaskId(id);
    setShowUpload(true);
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        fetchTasks();
      } catch (err) {
        setError('Failed to delete task.');
      }
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'pill-high';
      case 'medium': return 'pill-medium';
      case 'low': return 'pill-low';
      default: return 'glass-pill';
    }
  };

  const getStatusClass = (status) => {
      switch(status) {
          case 'todo': return 'pill-todo';
          case 'in_progress': return 'pill-progress';
          case 'done': return 'pill-done';
          default: return 'glass-pill';
      }
  };

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>My Tasks</h2>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <Button variant="link" className="text-decoration-none me-3 theme-toggle d-flex align-items-center" style={{ color: 'var(--text-primary)' }} onClick={() => setShowCategories(true)}>
             <Settings size={20} className="me-2" /> Categories
          </Button>
          <Button className="btn-primary-action" onClick={handleShowNewTask} title="Add New Task">
             <Plus size={28} />
          </Button>
        </Col>
      </Row>

      <Card className="mb-4 premium-card">
        <Card.Body>
          <Form onSubmit={(e) => { e.preventDefault(); fetchTasks(); }}>
            <Row className="g-2">
              <Col md={8}>
                <Form.Control 
                  type="text" 
                  placeholder="Search tasks by title or description..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Form.Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button type="submit" className="w-100 btn-glass-solid">Search</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" role="status">
             <span className="visually-hidden">Loading tasks...</span>
          </Spinner>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {tasks.length === 0 ? (
            <Col className="w-100 text-center text-muted">No tasks found. Create one!</Col>
          ) : (
            tasks.map(task => (
              <Col key={task.id}>
                <Card className="h-100 premium-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="text-truncate mb-0 fw-bold" style={{ maxWidth: '70%', letterSpacing: '-0.03em'}}>
                        {task.title}
                      </Card.Title>
                      <Badge bg="transparent" className={`glass-pill ${getPriorityClass(task.priority)}`}>
                        {task.priority?.toUpperCase() || 'NORMAL'}
                      </Badge>
                    </div>
                    
                    <Badge bg="transparent" className={`mb-3 glass-pill ${getStatusClass(task.status)}`}>
                        {task.status?.replace('_', ' ').toUpperCase() || 'TODO'}
                    </Badge>
                    
                    <Card.Text className="text-muted" style={{ fontSize: '0.9rem' }}>
                      {task.description ? task.description : 'No description provided.'}
                    </Card.Text>
                    
                    {task.categories?.length > 0 && (
                      <div className="mt-2 text-truncate">
                        <small className="text-muted fw-bold me-2" style={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.7rem' }}>Categories:</small>
                        {task.categories.map(cat => (
                           <Badge key={cat.id} bg="transparent" className="me-1 glass-pill" style={{ fontSize: '0.65rem' }}>
                              {cat.name}
                           </Badge>
                        ))}
                      </div>
                    )}
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="mt-3">
                        <small className="text-muted d-block mb-2 fw-bold" style={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.7rem' }}>Attachments:</small>
                        <div className="att-preview-grid">
                          {task.attachments.map(att => {
                            const url = getAttachmentUrl(task.id, att.filename);
                            return isImage(att.filename) ? (
                              <button
                                key={att.id}
                                className="att-thumb-btn"
                                onClick={() => setLightboxSrc(url)}
                                title={att.filename}
                              >
                                <img src={url} alt={att.filename} className="att-thumb" />
                                <span className="att-thumb-overlay">🔍</span>
                              </button>
                            ) : (
                              <Badge key={att.id} bg="transparent" className="me-1 glass-pill" style={{ fontSize: '0.65rem' }}>
                                {att.filename}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-flex justify-content-between align-items-center">
                       <small className="text-muted" style={{ fontWeight: 500 }}>
                         {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}
                       </small>
                       <div className="d-flex gap-2">
                         <Button variant="link" className="btn-glass-sm" onClick={() => handleShowUpload(task.id)} title="Upload Attachment">
                           <Upload size={16} />
                         </Button>
                         <Button variant="link" className="btn-glass-sm" onClick={() => handleEditTask(task)} title="Edit Task">
                           <Edit2 size={16} />
                         </Button>
                         <Button variant="link" className="btn-glass-sm" onClick={() => handleDeleteTask(task.id)} title="Delete Task" style={{ color: '#ef4444' }}>
                           <Trash2 size={16} />
                         </Button>
                       </div>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}

      <TaskModal 
        show={showModal} 
        handleClose={() => setShowModal(false)} 
        refreshTasks={fetchTasks} 
        editingTask={editingTask} 
      />

      <CategorySidebar 
        show={showCategories} 
        handleClose={() => setShowCategories(false)} 
      />

      <UploadModal 
        show={showUpload} 
        handleClose={() => setShowUpload(false)} 
        taskId={uploadTaskId}
        refreshTasks={fetchTasks}
      />

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
    </Container>
  );
};

export default Dashboard;
