import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
    return <div className="container loading">Loading...</div>;
  }

  if (!competition) {
    return <div className="container">Competition not found</div>;
  }

  return (
    <div className="container">
      {competition.bannerImage && (
        <img
          src={`http://localhost:5000/${competition.bannerImage}`}
          alt={competition.name}
          style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', marginBottom: '20px', borderRadius: '8px' }}
        />
      )}
      <h1>{competition.name}</h1>
      <div className="card">
        <p>{competition.description}</p>
        <p><strong>Status:</strong> {competition.status}</p>
        <p><strong>Qualified Users:</strong> {competition.currentQualifiedCount} / {competition.maxQualifiedUsers}</p>
      </div>

      {user && !user.isQualified && competition.status === 'active' && (
        <div className="card">
          <h2>Qualification Phase</h2>
          <p>Complete the qualification questions to participate in this competition.</p>
          <Link to={`/competitions/${id}/qualification`} className="btn btn-primary">
            Start Qualification
          </Link>
        </div>
      )}

      {user && user.isQualified && !user.teamId && (
        <div className="card">
          <h2>Team Formation</h2>
          <p>You are qualified! Create or join a team to participate.</p>
          <Link to="/team" className="btn btn-primary">
            Manage Team
          </Link>
        </div>
      )}

      {competition.stages && competition.stages.length > 0 && (
        <div className="card">
          <h2>Stages</h2>
          {competition.stages.map((stage) => (
            <div key={stage.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h3>{stage.name}</h3>
              <p>{stage.description}</p>
              <p><strong>Scoring:</strong> {stage.scoringType}</p>
              {stage.isActive && <span style={{ color: 'green' }}>Active</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitionDetail;

