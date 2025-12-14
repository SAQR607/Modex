import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Competitions from './pages/Competitions';
import CompetitionDetail from './pages/CompetitionDetail';
import Qualification from './pages/Qualification';
import Team from './pages/Team';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import CreateCompetition from './pages/CreateCompetition';
import Loading from './components/Loading';

const PrivateRoute = ({ children, requireRole }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/competitions" element={<Competitions />} />
          <Route path="/competitions/:id" element={<CompetitionDetail />} />
          <Route
            path="/competitions/:id/qualification"
            element={
              <PrivateRoute>
                <Qualification />
              </PrivateRoute>
            }
          />
          <Route
            path="/team"
            element={
              <PrivateRoute>
                <Team />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-competition"
            element={
              <PrivateRoute requireRole="admin">
                <CreateCompetition />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute requireRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/judge"
            element={
              <PrivateRoute requireRole="judge">
                <JudgeDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

