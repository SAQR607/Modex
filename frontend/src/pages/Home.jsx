import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container">
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <h1>Welcome to Modex Competition Platform</h1>
        <p style={{ fontSize: '18px', marginTop: '20px', color: '#666' }}>
          Join multi-stage competitions for CFO candidates. Showcase your skills,
          form teams, and compete for excellence.
        </p>
        {!isAuthenticated && (
          <div style={{ marginTop: '30px' }}>
            <Link to="/register" className="btn btn-primary" style={{ marginRight: '10px' }}>
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        )}
        {isAuthenticated && (
          <div style={{ marginTop: '30px' }}>
            <Link to="/competitions" className="btn btn-primary">
              View Competitions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

