import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Team = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [competitionId, setCompetitionId] = useState('');
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeam();
    fetchCompetitions();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await api.get('/api/teams/my-team');
      setTeam(response.data.team);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch team:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const response = await api.get('/api/competitions');
      setCompetitions(response.data.competitions.filter(c => c.status === 'active'));
    } catch (error) {
      console.error('Failed to fetch competitions:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/api/teams', {
        competitionId,
        name: teamName
      });
      fetchTeam();
      setTeamName('');
      setCompetitionId('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create team');
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/api/teams/join', { inviteCode });
      fetchTeam();
      setInviteCode('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to join team');
    }
  };

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  if (team) {
    return (
      <div className="container">
        <h1>My Team</h1>
        <div className="card">
          <h2>{team.name}</h2>
          <p><strong>Invite Code:</strong> {team.inviteCode}</p>
          <p><strong>Status:</strong> {team.isComplete ? 'Complete' : 'Incomplete'}</p>
          {team.isDisqualified && <p className="error">Team is disqualified</p>}

          <h3 style={{ marginTop: '20px' }}>Members</h3>
          <ul>
            {team.members && team.members.map((member) => (
              <li key={member.id}>
                {member.firstName} {member.lastName} ({member.teamRole || 'member'})
                {member.id === team.leaderId && ' - Leader'}
              </li>
            ))}
          </ul>

          {user.teamRole === 'leader' && (
            <div style={{ marginTop: '20px' }}>
              <h3>Assign Team Roles</h3>
              {team.members && team.members.filter(m => m.id !== team.leaderId).map((member) => (
                <div key={member.id} style={{ marginBottom: '10px' }}>
                  <span>{member.firstName} {member.lastName}</span>
                  <input
                    type="text"
                    placeholder="Role (e.g., Analyst, Researcher)"
                    value={member.teamRole || ''}
                    onBlur={async (e) => {
                      try {
                        await api.put('/api/teams/assign-role', {
                          userId: member.id,
                          teamRole: e.target.value
                        });
                        fetchTeam();
                      } catch (error) {
                        console.error('Failed to assign role:', error);
                      }
                    }}
                    style={{ marginLeft: '10px', padding: '5px' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Team Management</h1>
      {!user.isQualified && (
        <div className="card">
          <p className="error">You must be qualified to create or join a team.</p>
        </div>
      )}

      {user.isQualified && (
        <>
          <div className="card">
            <h2>Create Team</h2>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label>Competition</label>
                <select
                  value={competitionId}
                  onChange={(e) => setCompetitionId(e.target.value)}
                  required
                >
                  <option value="">Select Competition</option>
                  {competitions.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>
              {error && <div className="error">{error}</div>}
              <button type="submit" className="btn btn-primary">
                Create Team
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Join Team</h2>
            <form onSubmit={handleJoinTeam}>
              <div className="form-group">
                <label>Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  required
                />
              </div>
              {error && <div className="error">{error}</div>}
              <button type="submit" className="btn btn-primary">
                Join Team
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Team;

