const { Team, User, Competition } = require('../models');
const { Op } = require('sequelize');

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const createTeam = async (req, res) => {
  try {
    const { competitionId, name } = req.body;
    const leaderId = req.user.id;

    if (req.user.role !== 'leader' && !req.user.isQualified) {
      return res.status(403).json({ error: 'Only qualified users can create teams' });
    }

    if (req.user.teamId) {
      return res.status(400).json({ error: 'User is already in a team' });
    }

    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = generateInviteCode();
      const existing = await Team.findOne({ where: { inviteCode } });
      if (!existing) isUnique = true;
    }

    const team = await Team.create({
      name,
      inviteCode,
      competitionId,
      leaderId,
      maxMembers: 5
    });

    req.user.teamId = team.id;
    req.user.teamRole = 'leader';
    await req.user.save();

    res.status(201).json({ team });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
};

const joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (req.user.teamId) {
      return res.status(400).json({ error: 'User is already in a team' });
    }

    const team = await Team.findOne({
      where: { inviteCode },
      include: [{ association: 'members' }]
    });

    if (!team) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    if (team.isComplete || team.isDisqualified) {
      return res.status(400).json({ error: 'Team is full or disqualified' });
    }

    if (team.members.length >= team.maxMembers) {
      team.isComplete = true;
      await team.save();
      return res.status(400).json({ error: 'Team is full' });
    }

    req.user.teamId = team.id;
    req.user.teamRole = 'member';
    await req.user.save();

    // Check if team is now complete
    const updatedTeam = await Team.findByPk(team.id, {
      include: [{ association: 'members' }]
    });

    if (updatedTeam.members.length >= updatedTeam.maxMembers) {
      updatedTeam.isComplete = true;
      await updatedTeam.save();
    }

    res.json({ message: 'Joined team successfully', team: updatedTeam });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ error: 'Failed to join team' });
  }
};

const getTeam = async (req, res) => {
  try {
    const teamId = req.user.teamId;
    if (!teamId) {
      return res.status(404).json({ error: 'User is not in a team' });
    }

    const team = await Team.findByPk(teamId, {
      include: [
        { association: 'leader' },
        { association: 'members' },
        { association: 'competition' }
      ]
    });

    res.json({ team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
};

const assignTeamRole = async (req, res) => {
  try {
    const { userId, teamRole } = req.body;
    const teamId = req.user.teamId;

    if (!teamId || req.user.teamRole !== 'leader') {
      return res.status(403).json({ error: 'Only team leader can assign roles' });
    }

    const team = await Team.findByPk(teamId, {
      include: [{ association: 'members' }]
    });

    const member = team.members.find(m => m.id === parseInt(userId));
    if (!member) {
      return res.status(404).json({ error: 'Member not found in team' });
    }

    member.teamRole = teamRole;
    await member.save();

    res.json({ message: 'Team role assigned successfully', member });
  } catch (error) {
    console.error('Assign team role error:', error);
    res.status(500).json({ error: 'Failed to assign team role' });
  }
};

const getTeams = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const teams = await Team.findAll({
      where: { competitionId },
      include: [
        { association: 'leader' },
        { association: 'members' },
        { association: 'competition' }
      ]
    });

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

const disqualifyIncompleteTeams = async (req, res) => {
  try {
    const { competitionId } = req.params;

    const teams = await Team.findAll({
      where: {
        competitionId,
        isComplete: false,
        isDisqualified: false
      },
      include: [{ association: 'members' }]
    });

    const incompleteTeams = teams.filter(team => team.members.length < team.maxMembers);

    for (const team of incompleteTeams) {
      team.isDisqualified = true;
      await team.save();
    }

    res.json({
      message: `${incompleteTeams.length} teams disqualified`,
      disqualifiedCount: incompleteTeams.length
    });
  } catch (error) {
    console.error('Disqualify teams error:', error);
    res.status(500).json({ error: 'Failed to disqualify teams' });
  }
};

module.exports = {
  createTeam,
  joinTeam,
  getTeam,
  assignTeamRole,
  getTeams,
  disqualifyIncompleteTeams
};

