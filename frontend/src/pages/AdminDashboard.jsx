import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
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
    return <div className="container loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <div className="card">
        <h2>Competitions Management</h2>
        <p>Admin features for managing competitions, users, and judging will be available here.</p>
        {competitions.map((comp) => (
          <div key={comp.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd' }}>
            <h3>{comp.name}</h3>
            <p>Status: {comp.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

