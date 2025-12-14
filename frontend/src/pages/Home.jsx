import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to MODEX</h1>
            <p className="hero-subtitle">
              Join multi-stage competitions for CFO candidates. Showcase your skills,
              form teams, and compete for excellence in financial modeling and strategic decision-making.
            </p>
            {!isAuthenticated && (
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Login
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="hero-actions">
                <Link to="/competitions" className="btn btn-primary btn-large">
                  View Competitions
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="home-features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Financial Modeling</h3>
              <p>Test your skills in building comprehensive financial models and projections.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Team Collaboration</h3>
              <p>Form teams and work together to solve complex financial challenges.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Competitive Excellence</h3>
              <p>Compete in multi-stage competitions designed for CFO candidates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
