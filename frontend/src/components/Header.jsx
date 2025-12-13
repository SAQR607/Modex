import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
          Modex Competition Platform
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
                <span style={{ marginLeft: '10px' }}>
                  {user.firstName} {user.lastName} ({user.role})
                </span>
              )}
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

