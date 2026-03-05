import React, { useState, useEffect } from 'react';
import { Offcanvas, ListGroup, Button, Form, InputGroup } from 'react-bootstrap';
import { getCategories, createCategory } from '../services/categories';

const CategorySidebar = ({ show, handleClose }) => {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetchCategories();
    }
  }, [show]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setLoading(true);
    try {
      await createCategory({ name: newCatName.trim(), description: null });
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Offcanvas show={show} onHide={handleClose} placement="start">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Manage Categories</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form onSubmit={handleCreate} className="mb-4">
          <InputGroup>
            <Form.Control
              placeholder="New category..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              disabled={loading}
              required
            />
            <Button type="submit" className="btn-glass-solid" disabled={loading}>
              Add
            </Button>
          </InputGroup>
        </Form>
        <ListGroup variant="flush">
          {categories.length === 0 ? (
            <div className="text-muted">No categories found.</div>
          ) : (
            categories.map(cat => (
              <ListGroup.Item key={cat.id} className="d-flex justify-content-between align-items-center">
                {cat.name}
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CategorySidebar;
