const Battle = require('../models/Battle');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// @desc    Create battle challenge
// @route   POST /api/battles/challenge
// @access  Private
const createBattleChallenge = async (req, res) => {
  try {
    const { opponentId } = req.body;

    // Check if opponent exists
    const opponent = await User.findById(opponentId);
    if (!opponent) {
      return res.status(404).json({ error: 'Opponent not found' });
    }

    // Can't challenge yourself
    if (req.user._id.toString() === opponentId) {
      return res.status(400).json({ error: 'Cannot challenge yourself' });
    }

    // Create battle
    const battle = await Battle.create({
      challenger: req.user._id,
      opponent: opponentId,
      roomId: uuidv4(),
      status: 'pending',
    });

    // Create notification for opponent
    await Notification.create({
      user: opponentId,
      type: 'battle_challenge',
      title: 'New Battle Challenge',
      message: `${req.user.username} challenged you to a battle!`,
      data: { battleId: battle._id },
      link: `/battles/${battle._id}`,
    });

    // Emit socket event
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

// @desc    Accept battle challenge
// @route   PUT /api/battles/:id/accept
// @access  Private
const acceptBattleChallenge = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id);

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    // Check if user is the opponent
    if (battle.opponent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Select random problem
    const randomProblem = await Problem.aggregate([{ $sample: { size: 1 } }]);
    if (!randomProblem.length) {
      return res.status(500).json({ error: 'No problems available' });
    }

    // Update battle
    battle.status = 'in_progress';
    battle.problem = randomProblem[0]._id;
    battle.startTime = new Date();
    await battle.save();

    const populatedBattle = await Battle.findById(battle._id)
      .populate('challenger', 'username rating profilePicture')
      .populate('opponent', 'username rating profilePicture')
      .populate('problem');

    // Emit socket event to both users
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

// @desc    Decline battle challenge
// @route   PUT /api/battles/:id/decline
// @access  Private
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

    // Notify challenger
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

// @desc    Get user battles
// @route   GET /api/battles/my-battles
// @access  Private
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

// @desc    Get battle by ID
// @route   GET /api/battles/:id
// @access  Private
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
