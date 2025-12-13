import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div className="card">
        <h2>Welcome, {user?.firstName} {user?.lastName}!</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Qualified:</strong> {user?.isQualified ? 'Yes' : 'No'}</p>
        {user?.teamId && (
          <p><strong>Team ID:</strong> {user.teamId}</p>
        )}
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <Link to="/competitions" className="btn btn-primary" style={{ marginRight: '10px' }}>
          View Competitions
        </Link>
        {user?.isQualified && (
          <Link to="/team" className="btn btn-primary">
            Manage Team
          </Link>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

