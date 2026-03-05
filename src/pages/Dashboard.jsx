import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { getTasks, deleteTask } from '../services/tasks';
import TaskModal from '../components/TaskModal';
import CategorySidebar from '../components/CategorySidebar';
import UploadModal from '../components/UploadModal';

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

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'pending': return 'warning';
          case 'in_progress': return 'primary';
          case 'completed': return 'success';
          default: return 'secondary';
      }
  };

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>My Tasks</h2>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" className="me-2" onClick={() => setShowCategories(true)}>Manage Categories</Button>
          <Button variant="primary" onClick={handleShowNewTask}>Add New Task</Button>
        </Col>
      </Row>

      <Card className="mb-4 shadow-sm">
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
                <Button type="submit" variant="dark" className="w-100">Search</Button>
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
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="text-truncate mb-0" style={{ maxWidth: '70%'}}>
                        {task.title}
                      </Card.Title>
                      <Badge bg={getPriorityColor(task.priority)}>
                        {task.priority?.toUpperCase() || 'NORMAL'}
                      </Badge>
                    </div>
                    
                    <Badge bg={getStatusColor(task.status)} className="mb-3">
                        {task.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                    </Badge>
                    
                    <Card.Text className="text-muted" style={{ fontSize: '0.9rem' }}>
                      {task.description ? task.description : 'No description provided.'}
                    </Card.Text>
                    
                    {task.categories?.length > 0 && (
                      <div className="mt-2 text-truncate">
                        <small className="text-muted fw-bold me-2">Categories:</small>
                        {task.categories.map(cat => (
                           <Badge key={cat.id} bg="light" text="dark" border="secondary" className="me-1 border">
                              {cat.name}
                           </Badge>
                        ))}
                      </div>
                    )}
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="mt-3">
                        <small className="text-muted d-block mb-1">Attachments:</small>
                        {task.attachments.map(att => (
                          <Badge bg="secondary" className="me-1" key={att.id}>{att.filename}</Badge>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-white border-top-0 pt-0">
                    <div className="d-flex justify-content-between align-items-center">
                       <small className="text-muted">
                         {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}
                       </small>
                       <div>
                         <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowUpload(task.id)}>Upload</Button>
                         <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleEditTask(task)}>Edit</Button>
                         <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTask(task.id)}>Delete</Button>
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
    </Container>
  );
};

export default Dashboard;
