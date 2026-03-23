const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const logger = require('../utils/logger');

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
const getProblems = async (req, res) => {
  try {
    const { difficulty, tags, search, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const problems = await Problem.find(query)
      .select('-testCases -solutionTemplate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Problem.countDocuments(query);

    res.json({
      success: true,
      data: problems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error(`Get problems error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get problem by ID or slug
// @route   GET /api/problems/:id
// @access  Public
const getProblemById = async (req, res) => {
  try {
    let problem;
    
    // Check if it's a MongoDB ID or slug
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      problem = await Problem.findById(req.params.id).select('-solutionTemplate');
    } else {
      problem = await Problem.findOne({ slug: req.params.id }).select('-solutionTemplate');
    }

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Get sample test cases
    const sampleTestCases = await TestCase.find({
      problem: problem._id,
      isSample: true,
    }).select('-isHidden');

    res.json({
      success: true,
      data: {
        ...problem.toObject(),
        sampleTestCases,
      },
    });
  } catch (error) {
    logger.error(`Get problem error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get problem test cases (for judge service)
// @route   GET /api/problems/:id/testcases
// @access  Private (Judge Service only)
const getProblemTestCases = async (req, res) => {
  try {
    const testCases = await TestCase.find({ problem: req.params.id });
    
    res.json({
      success: true,
      data: testCases,
    });
  } catch (error) {
    logger.error(`Get test cases error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getProblems,
  getProblemById,
  getProblemTestCases,
};
