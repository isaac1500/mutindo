import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert, Badge, Tabs, Tab, ProgressBar } from 'react-bootstrap';
import { FaUpload, FaTrash, FaImage, FaCloudUploadAlt, FaCheck, FaTimes, FaEdit, FaEye, FaCopy, FaStar, FaHeart, FaUtensils, FaHome, FaCamera, FaShoppingBag, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AdvancedImageManager = () => {
  const [activeTab, setActiveTab] = useState('gallery');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [imageTitle, setImageTitle] = useState('');
  const [imageCategory, setImageCategory] = useState('gallery');
  const [imageDescription, setImageDescription] = useState('');
  const [imageTags, setImageTags] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const sections = [
    { id: 'gallery', name: 'Gallery', icon: FaCamera, description: 'Event photos, kitchen moments, customer celebrations' },
    { id: 'menu', name: 'Menu Items', icon: FaUtensils, description: 'Food item images displayed on menu page' },
    { id: 'hero', name: 'Hero Banner', icon: FaHome, description: 'Main homepage background banner (only 1 active)' },
    { id: 'logo', name: 'Logo', icon: FaStar, description: 'Restaurant logo displayed in header' },
    { id: 'testimonials', name: 'Testimonials', icon: FaUsers, description: 'Customer photo with reviews' },
    { id: 'promotions', name: 'Promotions', icon: FaShoppingBag, description: 'Special offer banners' }
  ];

  const pagePreviews = {
    gallery: (image) => (
      <div style={{ textAlign: 'center', padding: '10px' }}>
        <img src={image.imageUrl || image.url} alt={image.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
        <div className="mt-2"><small className="text-muted">Gallery Grid View</small></div>
      </div>
    ),
    menu: (image) => (
      <div style={{ textAlign: 'center', padding: '10px' }}>
        <div style={{ background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
          <img src={image.imageUrl || image.url} alt={image.title} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
          <div style={{ padding: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{image.title}</div>
            <div style={{ fontSize: '10px', color: '#FF6B35' }}>UGX 15,000</div>
          </div>
        </div>
      </div>
    ),
    hero: (image) => (
      <div style={{ textAlign: 'center', padding: '10px' }}>
        <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden', height: '100px', position: 'relative' }}>
          <img src={image.imageUrl || image.url} alt={image.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', textAlign: 'center', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px', fontSize: '10px' }}>
            Hero Banner
          </div>
        </div>
      </div>
    ),
    logo: (image) => (
      <div style={{ textAlign: 'center', padding: '10px' }}>
        <img src={image.imageUrl || image.url} alt={image.title} style={{ height: '50px', objectFit: 'contain' }} />
        <div className="mt-1"><small className="text-muted">Header Logo</small></div>
      </div>
    ),
    testimonials: (image) => (
      <div style={{ textAlign: 'center', padding: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1a1a1a', padding: '10px', borderRadius: '8px' }}>
          <img src={image.imageUrl || image.url} alt={image.title} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{image.title || 'Customer Name'}</div>
            <div style={{ fontSize: '10px', color: '#FFD700' }}>★★★★☆</div>
            <div style={{ fontSize: '10px', color: 'rgba(240,236,228,0.5)' }}>"Amazing food!"</div>
          </div>
        </div>
      </div>
    ),
    promotions: (image) => (
      <div style={{ textAlign: 'center', padding: '10px' }}>
        <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '10px' }}>
          <img src={image.imageUrl || image.url} alt={image.title} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
          <div className="mt-1"><small className="text-warning">🔥 Special Offer Banner</small></div>
        </div>
      </div>
    )
  };

  useEffect(() => {
    fetchImages();
  }, [activeTab]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/images');
      let allImages = response.data.images || [];
      const filtered = allImages.filter(img => img.category === activeTab);
      setImages(filtered);
    } catch (err) {
      console.error('Error fetching images:', err);
      toast.error('Failed to load images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    setShowModal(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
      setShowModal(true);
    }
  };

  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', imageTitle || file.name.split('.')[0]);
      formData.append('category', imageCategory);
      formData.append('description', imageDescription);
      formData.append('tags', imageTags);
      formData.append('alt', imageAlt);

      try {
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
        await api.post('/images/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        successCount++;
      } catch (err) {
        console.error('Upload error:', err);
        failCount++;
      }
    }

    toast.success(`Uploaded ${successCount} images${failCount > 0 ? `, ${failCount} failed` : ''}`);
    setShowModal(false);
    setSelectedFiles([]);
    setPreviews([]);
    setImageTitle('');
    setImageDescription('');
    setImageTags('');
    setImageAlt('');
    setUploadProgress(0);
    fetchImages();
    setUploading(false);
  };

  const handleDelete = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      try {
        await api.delete(`/images/${imageId}`);
        toast.success('Image deleted successfully');
        fetchImages();
      } catch (err) {
        toast.error('Failed to delete image');
      }
    }
  };

  const handleSetAsActive = async (imageId, category) => {
    try {
      if (category === 'hero') {
        const allImages = await api.get('/images');
        const heroImages = allImages.data.images.filter(img => img.category === 'hero');
        for (const img of heroImages) {
          if (img.isActive) {
            await api.patch(`/images/${img.id}/toggle`);
          }
        }
      }
      
      await api.patch(`/images/${imageId}/toggle`);
      toast.success('Image set as active');
      fetchImages();
    } catch (err) {
      toast.error('Failed to set as active');
    }
  };

  const getSectionIcon = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? <section.icon size={18} /> : <FaImage />;
  };

  // Helper function to render tags safely
  const renderTags = (tags) => {
    if (!tags) return null;
    if (Array.isArray(tags)) {
      return tags.map((tag, idx) => (
        <Badge key={idx} bg="secondary" className="me-1">{tag}</Badge>
      ));
    }
    if (typeof tags === 'string') {
      return tags.split(',').map((tag, idx) => (
        <Badge key={idx} bg="secondary" className="me-1">{tag.trim()}</Badge>
      ));
    }
    return null;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading images...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Advanced Image Manager</h1>
          <p className="text-muted">Manage all images across your website from one place</p>
        </div>
        <Button variant="primary" onClick={() => fileInputRef.current.click()}>
          <FaUpload className="me-2" /> Bulk Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        fill
      >
        {sections.map(section => (
          <Tab 
            key={section.id} 
            eventKey={section.id} 
            title={
              <span>
                {getSectionIcon(section.id)} {section.name}
                <Badge bg="secondary" className="ms-2">{images.length}</Badge>
              </span>
            }
          >
            <div className="mb-3">
              <Alert variant="info">
                <strong>{section.name}</strong> - {section.description}
                <hr />
                <small>Upload images with category "{section.id}" to display here.</small>
              </Alert>
            </div>

            {images.length === 0 ? (
              <Card className="text-center py-5">
                <Card.Body>
                  <FaImage size={48} className="text-muted mb-3" />
                  <h5>No images in {section.name}</h5>
                  <p>Click "Bulk Upload" to add images to this section</p>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                {images.map(image => (
                  <Col md={4} lg={3} className="mb-4" key={image.id}>
                    <Card className="shadow-sm h-100">
                      <div style={{ position: 'relative' }}>
                        <img
                          src={image.imageUrl || image.url}
                          alt={image.title}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px'
                          }}
                        />
                        {image.isActive && (
                          <Badge bg="success" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                            <FaCheck className="me-1" /> Active
                          </Badge>
                        )}
                        <Badge
                          bg="info"
                          style={{ position: 'absolute', top: '10px', right: '10px' }}
                        >
                          {image.category}
                        </Badge>
                      </div>
                      <Card.Body>
                        <Card.Title className="h6">{image.title || 'Untitled'}</Card.Title>
                        {image.description && (
                          <Card.Text className="small text-muted">{image.description}</Card.Text>
                        )}
                        <div className="mb-2">
                          {renderTags(image.tags)}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <small className="text-muted">
                            {new Date(image.createdAt).toLocaleDateString()}
                          </small>
                          <div>
                            {activeTab === 'hero' && !image.isActive && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-2"
                                onClick={() => handleSetAsActive(image.id, image.category)}
                              >
                                <FaStar /> Set Active
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(image.id)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                      <Card.Footer className="bg-white">
                        <div className="text-center">
                          <small className="text-muted">Live Preview:</small>
                          {pagePreviews[activeTab]?.(image) || pagePreviews.gallery(image)}
                        </div>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
        ))}
      </Tabs>

      {/* Bulk Upload Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Bulk Upload Images</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragOver ? '#FF6B35' : '#dee2e6'}`,
                  borderRadius: '8px',
                  padding: '30px',
                  textAlign: 'center',
                  background: dragOver ? 'rgba(255,107,53,0.05)' : 'transparent',
                  transition: 'all 0.3s',
                  minHeight: '200px'
                }}
              >
                <FaCloudUploadAlt size={48} className="text-muted mb-3" />
                <p>Drag & drop images here or click to select</p>
                <Button variant="outline-primary" size="sm" onClick={() => fileInputRef.current.click()}>
                  Select Files
                </Button>
                <p className="small text-muted mt-2">Supported: JPG, PNG, GIF, WEBP (Max 5MB each)</p>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-3">
                  <strong>{selectedFiles.length} files selected</strong>
                  <ul className="small mt-2">
                    {selectedFiles.slice(0, 5).map((file, idx) => (
                      <li key={idx}>{file.name} ({(file.size / 1024).toFixed(0)} KB)</li>
                    ))}
                    {selectedFiles.length > 5 && <li>+{selectedFiles.length - 5} more</li>}
                  </ul>
                </div>
              )}
            </Col>
            <Col md={6}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select value={imageCategory} onChange={(e) => setImageCategory(e.target.value)}>
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>{section.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Title (applies to all)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Image title"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Image description"
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Tags (comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="food, catering, event"
                    value={imageTags}
                    onChange={(e) => setImageTags(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Alt Text (SEO)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Alternative text for screen readers"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Col>
          </Row>
          
          {uploading && (
            <div className="mt-3">
              <ProgressBar now={uploadProgress} label={`${Math.round(uploadProgress)}%`} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBulkUpload} 
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? <Spinner as="span" animation="border" size="sm" /> : <FaCloudUploadAlt />}
            {uploading ? ' Uploading...' : ` Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdvancedImageManager;