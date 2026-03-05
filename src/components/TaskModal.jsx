import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { createTask, updateTask } from '../services/tasks';
import { getCategories } from '../services/categories';

const TaskModal = ({ show, handleClose, refreshTasks, editingTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  const [availableCategories, setAvailableCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setDueDate(editingTask.due_date ? editingTask.due_date.split('T')[0] : '');
      setSelectedCategories(editingTask.categories?.map(c => c.id) || []);
    } else {
      resetForm();
    }
  }, [editingTask, show]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setAvailableCategories(data);
    } catch (err) {
      console.error("Failed to load categories.");
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDueDate('');
    setSelectedCategories([]);
    setError('');
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title,
      description: description || null,
      priority,
      status,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      category_ids: selectedCategories
    };

    try {
      if (editingTask) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask(payload);
      }
      refreshTasks();
      handleClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(d => `${d.loc.at(-1)}: ${d.msg}`).join(', '));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to save task.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{editingTask ? 'Edit Task' : 'New Task'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} id="taskForm">
          <Form.Group className="mb-3">
            <Form.Label>Title *</Form.Label>
            <Form.Control
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <div className="row">
            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categories</Form.Label>
            <div className="d-flex flex-wrap gap-2 mt-1">
              {availableCategories.length === 0 ? (
                <span className="text-muted small">No categories available. Please add some first.</span>
              ) : (
                availableCategories.map(cat => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <div 
                      key={cat.id} 
                      className={`category-toggle-pill ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleCategoryToggle(cat.id)}
                    >
                      {cat.name}
                    </div>
                  );
                })
              )}
            </div>
            <Form.Text className="text-muted d-block mt-2">
              Click on a category to select or deselect it.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="taskForm" disabled={loading}>
          {loading ? 'Saving...' : 'Save Task'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskModal;
