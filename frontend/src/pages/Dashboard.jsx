import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.firstName}!</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card profile-card">
            <h2>Profile Information</h2>
            <div className="profile-info">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role</span>
                <span className="info-value role-badge">{user?.role}</span>
              </div>
              {user?.teamId && (
                <div className="info-item">
                  <span className="info-label">Team ID</span>
                  <span className="info-value">{user.teamId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-card actions-card">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/competitions" className="btn btn-primary btn-large">
                View Competitions
              </Link>
              {isAdmin && (
                <Link to="/create-competition" className="btn btn-primary btn-large">
                  Create New Competition
                </Link>
              )}
              {user?.teamId && (
                <Link to="/team" className="btn btn-secondary btn-large">
                  Manage Team
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
