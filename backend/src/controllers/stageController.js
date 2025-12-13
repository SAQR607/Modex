const { Stage, Competition, Submission, Team } = require('../models');

const createStage = async (req, res) => {
  try {
    const { competitionId, name, description, order, scoringType, instructions, startDate, endDate } = req.body;

    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    const stage = await Stage.create({
      competitionId,
      name,
      description,
      order: order || 0,
      scoringType: scoringType || 'automatic',
      instructions,
      startDate,
      endDate
    });

    res.status(201).json({ stage });
  } catch (error) {
    console.error('Create stage error:', error);
    res.status(500).json({ error: 'Failed to create stage' });
  }
};

const getStages = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const stages = await Stage.findAll({
      where: { competitionId },
      order: [['order', 'ASC']]
    });

    res.json({ stages });
  } catch (error) {
    console.error('Get stages error:', error);
    res.status(500).json({ error: 'Failed to fetch stages' });
  }
};

const updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, order, scoringType, instructions, startDate, endDate, isActive } = req.body;

    const stage = await Stage.findByPk(id);
    if (!stage) {
      return res.status(404).json({ error: 'Stage not found' });
    }

    if (name) stage.name = name;
    if (description) stage.description = description;
    if (order !== undefined) stage.order = order;
    if (scoringType) stage.scoringType = scoringType;
    if (instructions) stage.instructions = instructions;
    if (startDate) stage.startDate = startDate;
    if (endDate) stage.endDate = endDate;
    if (isActive !== undefined) stage.isActive = isActive;

    await stage.save();

    res.json({ stage });
  } catch (error) {
    console.error('Update stage error:', error);
    res.status(500).json({ error: 'Failed to update stage' });
  }
};

const deleteStage = async (req, res) => {
  try {
    const { id } = req.params;
    const stage = await Stage.findByPk(id);

    if (!stage) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    await stage.destroy();
    res.json({ message: 'Stage deleted successfully' });
  } catch (error) {
    console.error('Delete stage error:', error);
    res.status(500).json({ error: 'Failed to delete stage' });
  }
};

module.exports = {
  createStage,
  getStages,
  updateStage,
  deleteStage
};

