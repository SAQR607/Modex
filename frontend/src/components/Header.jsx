import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout, isAdmin, isJudge } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-text">MODEX</span>
          <span className="logo-subtitle">Competition Platform</span>
        </Link>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/competitions">Competitions</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              {isAdmin && <Link to="/admin">Admin</Link>}
              {isJudge && <Link to="/judge">Judge</Link>}
              {user && (
                <div className="user-info">
                  <span className="user-name">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="user-role">{user.role}</span>
                </div>
              )}
              <button onClick={handleLogout} className="btn btn-secondary btn-small">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-small">Login</Link>
              <Link to="/register" className="btn btn-secondary btn-small">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
