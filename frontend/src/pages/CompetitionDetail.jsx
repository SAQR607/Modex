import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CompetitionDetail.css';

const CompetitionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetition();
  }, [id]);

  const fetchCompetition = async () => {
    try {
      const response = await api.get(`/api/competitions/${id}`);
      setCompetition(response.data.competition);
    } catch (error) {
      console.error('Failed to fetch competition:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="competition-detail-page">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="competition-detail-page">
        <div className="container">
          <div className="card">
            <p>Competition not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="competition-detail-page">
      <div className="container">
        {competition.bannerImage && (
          <div className="competition-banner">
            <img
              src={`http://localhost:5000/${competition.bannerImage}`}
              alt={competition.name}
            />
          </div>
        )}
        <div className="competition-header">
          <h1>{competition.name}</h1>
          <span className={`status-badge status-${competition.status?.toLowerCase()}`}>
            {competition.status}
          </span>
        </div>

        <div className="card competition-info">
          <h2>About</h2>
          <p>{competition.description}</p>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Qualified Users</span>
              <span className="info-value">
                {competition.currentQualifiedCount} / {competition.maxQualifiedUsers}
              </span>
            </div>
          </div>
        </div>

        {user && !user.isQualified && competition.status === 'active' && (
          <div className="card action-card">
            <h2>Qualification Phase</h2>
            <p>Complete the qualification questions to participate in this competition.</p>
            <Link to={`/competitions/${id}/qualification`} className="btn btn-primary">
              Start Qualification
            </Link>
          </div>
        )}

        {user && user.isQualified && !user.teamId && (
          <div className="card action-card">
            <h2>Team Formation</h2>
            <p>You are qualified! Create or join a team to participate.</p>
            <Link to="/team" className="btn btn-primary">
              Manage Team
            </Link>
          </div>
        )}

        {competition.stages && competition.stages.length > 0 && (
          <div className="card">
            <h2>Competition Stages</h2>
            <div className="stages-list">
              {competition.stages.map((stage) => (
                <div key={stage.id} className="stage-item">
                  <div className="stage-header">
                    <h3>{stage.name}</h3>
                    {stage.isActive && <span className="active-badge">Active</span>}
                  </div>
                  <p className="stage-description">{stage.description}</p>
                  <div className="stage-meta">
                    <span className="meta-item">
                      <strong>Scoring:</strong> {stage.scoringType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionDetail;
