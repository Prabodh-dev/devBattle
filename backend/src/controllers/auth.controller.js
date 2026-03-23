const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          profilePicture: user.profilePicture,
          rating: user.rating,
          rank: user.rank,
          stats: user.stats,
        },
        token,
      },
    });
  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update user status
    user.isOnline = true;
    user.lastSeen = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          profilePicture: user.profilePicture,
          rating: user.rating,
          rank: user.rank,
          stats: user.stats,
        },
        token,
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`GetMe error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Update user status
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: Date.now(),
      socketId: null,
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
