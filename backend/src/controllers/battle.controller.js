const Battle = require('../models/Battle');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const createBattleChallenge = async (req, res) => {
  try {
    const { opponentId } = req.body;
    const opponent = await User.findById(opponentId);
    if (!opponent) {
      return res.status(404).json({ error: 'Opponent not found' });
    }
    if (req.user._id.toString() === opponentId) {
      return res.status(400).json({ error: 'Cannot challenge yourself' });
    }
    const battle = await Battle.create({
      challenger: req.user._id,
      opponent: opponentId,
      roomId: uuidv4(),
      status: 'pending',
    });
    await Notification.create({
      user: opponentId,
      type: 'battle_challenge',
      title: 'New Battle Challenge',
      message: `${req.user.username} challenged you to a battle!`,
      data: { battleId: battle._id },
      link: `/battles/${battle._id}`,
    });
    const io = req.app.get('io');
    if (opponent.socketId) {
      io.to(opponent.socketId).emit('battle:challenge', {
        battle,
        challenger: {
          id: req.user._id,
          username: req.user.username,
          rating: req.user.rating,
          profilePicture: req.user.profilePicture,
        },
      });
    }
    res.status(201).json({
      success: true,
      data: battle,
    });
  } catch (error) {
    logger.error(`Create battle challenge error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};
const acceptBattleChallenge = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id);
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    if (battle.opponent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const randomProblem = await Problem.aggregate([{ $sample: { size: 1 } }]);
    if (!randomProblem.length) {
      return res.status(500).json({ error: 'No problems available' });
    }
    battle.status = 'in_progress';
    battle.problem = randomProblem[0]._id;
    battle.startTime = new Date();
    await battle.save();
    const populatedBattle = await Battle.findById(battle._id)
      .populate('challenger', 'username rating profilePicture')
      .populate('opponent', 'username rating profilePicture')
      .populate('problem');
    const io = req.app.get('io');
    const challenger = await User.findById(battle.challenger);
    if (challenger.socketId) {
      io.to(challenger.socketId).emit('battle:started', populatedBattle);
    }
    if (req.user.socketId) {
      io.to(req.user.socketId).emit('battle:started', populatedBattle);
    }
    res.json({
      success: true,
      data: populatedBattle,
    });
  } catch (error) {
    logger.error(`Accept battle error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};
const declineBattleChallenge = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id);
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    if (battle.opponent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    battle.status = 'declined';
    await battle.save();
    const io = req.app.get('io');
    const challenger = await User.findById(battle.challenger);
    if (challenger.socketId) {
      io.to(challenger.socketId).emit('battle:declined', { battleId: battle._id });
    }
    res.json({
      success: true,
      data: battle,
    });
  } catch (error) {
    logger.error(`Decline battle error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};
const getUserBattles = async (req, res) => {
  try {
    const battles = await Battle.find({
      $or: [{ challenger: req.user._id }, { opponent: req.user._id }],
    })
      .populate('challenger', 'username rating profilePicture')
      .populate('opponent', 'username rating profilePicture')
      .populate('problem', 'title difficulty')
      .populate('winner', 'username')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({
      success: true,
      data: battles,
    });
  } catch (error) {
    logger.error(`Get user battles error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};
const getBattleById = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id)
      .populate('challenger', 'username rating profilePicture')
      .populate('opponent', 'username rating profilePicture')
      .populate('problem')
      .populate('winner', 'username');
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    res.json({
      success: true,
      data: battle,
    });
  } catch (error) {
    logger.error(`Get battle error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};
module.exports = {
  createBattleChallenge,
  acceptBattleChallenge,
  declineBattleChallenge,
  getUserBattles,
  getBattleById,
};
