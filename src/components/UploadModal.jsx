import React, { useState } from 'react';
import { Modal, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { uploadAttachment } from '../services/tasks';

const UploadModal = ({ show, handleClose, taskId, refreshTasks }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !taskId) return;
    
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadAttachment(taskId, formData);
      setFile(null);
      refreshTasks();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Upload Attachment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleUpload} id="uploadForm">
          <Form.Group className="mb-3">
            <Form.Label>Select File</Form.Label>
            <Form.Control type="file" required onChange={handleFileChange} disabled={loading} />
          </Form.Group>
          {loading && <ProgressBar animated now={100} label="Uploading..." className="mb-3" />}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="success" type="submit" form="uploadForm" disabled={loading || !file}>
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadModal;
