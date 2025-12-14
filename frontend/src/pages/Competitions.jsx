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
      const response = await api.get('/api/competitions');
      setCompetitions(response.data.competitions);
    } catch (error) {
      console.error('Failed to fetch competitions:', error);
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
