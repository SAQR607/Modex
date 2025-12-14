import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CreateCompetition.css';

const CreateCompetition = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxQualifiedUsers: 100
  });
  const [bannerImage, setBannerImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBannerImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('maxQualifiedUsers', formData.maxQualifiedUsers);
      
      if (bannerImage) {
        formDataToSend.append('bannerImage', bannerImage);
      }

      const response = await api.post('/api/competitions', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.competition) {
        navigate(`/competitions/${response.data.competition.id}`);
      } else {
        navigate('/competitions');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create competition');
      console.error('Create competition error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="create-competition-page">
      <div className="container">
        <div className="create-competition-header">
          <h1>Create New Competition</h1>
          <p className="subtitle">Set up a new competition for participants</p>
        </div>

        <div className="create-competition-card">
          <form onSubmit={handleSubmit} className="create-competition-form">
            <div className="form-group">
              <label htmlFor="name">Competition Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter competition name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Enter competition description"
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxQualifiedUsers">Max Qualified Users</label>
              <input
                type="number"
                id="maxQualifiedUsers"
                name="maxQualifiedUsers"
                value={formData.maxQualifiedUsers}
                onChange={handleChange}
                min="1"
                placeholder="100"
                className="form-input"
              />
              <small className="form-hint">Maximum number of users who can qualify for this competition</small>
            </div>

            <div className="form-group">
              <label htmlFor="bannerImage">Banner Image (Optional)</label>
              <input
                type="file"
                id="bannerImage"
                name="bannerImage"
                onChange={handleFileChange}
                accept="image/*"
                className="form-input"
              />
              <small className="form-hint">Upload a banner image for the competition (JPEG, PNG, GIF, WebP)</small>
              {bannerImage && (
                <div className="file-preview">
                  <p>Selected: {bannerImage.name}</p>
                </div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Competition'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCompetition;

