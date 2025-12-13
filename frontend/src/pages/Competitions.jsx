import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

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
    return <div className="container loading">Loading competitions...</div>;
  }

  return (
    <div className="container">
      <h1>Competitions</h1>
      {competitions.length === 0 ? (
        <div className="card">
          <p>No competitions available at the moment.</p>
        </div>
      ) : (
        <div>
          {competitions.map((competition) => (
            <div key={competition.id} className="card">
              {competition.bannerImage && (
                <img
                  src={`http://localhost:5000/${competition.bannerImage}`}
                  alt={competition.name}
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginBottom: '15px' }}
                />
              )}
              <h2>{competition.name}</h2>
              <p>{competition.description}</p>
              <p>
                <strong>Status:</strong> {competition.status}
              </p>
              <Link to={`/competitions/${competition.id}`} className="btn btn-primary">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Competitions;

