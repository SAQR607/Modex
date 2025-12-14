import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Competitions.css';

const Competitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      console.log('🔍 FRONTEND: Fetching competitions from /api/competitions');
      const response = await api.get('/api/competitions');
      console.log('✅ FRONTEND: Response received:', response);
      console.log('📋 FRONTEND: Response data:', response.data);
      console.log('📋 FRONTEND: Competitions array:', response.data.competitions);
      console.log('📊 FRONTEND: Number of competitions:', response.data.competitions?.length || 0);
      
      if (response.data && response.data.competitions) {
        setCompetitions(response.data.competitions);
        console.log('✅ FRONTEND: Competitions state updated with', response.data.competitions.length, 'items');
      } else {
        console.warn('⚠️ FRONTEND: Response structure unexpected:', response.data);
        setCompetitions([]);
      }
    } catch (error) {
      console.error('❌ FRONTEND: Failed to fetch competitions:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="competitions-page">
        <div className="container">
          <div className="loading">Loading competitions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="competitions-page">
      <div className="container">
        <div className="page-header">
          <h1>Competitions</h1>
          <p className="page-subtitle">Browse available competitions and join the challenge</p>
        </div>
        {competitions.length === 0 ? (
          <div className="card empty-state">
            <p>No competitions available at the moment.</p>
          </div>
        ) : (
          <div className="competitions-grid">
            {competitions.map((competition) => (
              <div key={competition.id} className="competition-card">
                {competition.bannerImage && (
                  <div className="competition-image">
                    <img
                      src={`http://localhost:5000/${competition.bannerImage}`}
                      alt={competition.name}
                    />
                  </div>
                )}
                <div className="competition-content">
                  <h2>{competition.name}</h2>
                  <p className="competition-description">{competition.description}</p>
                  <div className="competition-meta">
                    <span className={`status-badge status-${competition.status?.toLowerCase()}`}>
                      {competition.status}
                    </span>
                  </div>
                  <Link to={`/competitions/${competition.id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Competitions;
