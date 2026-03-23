const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const Battle = require('../models/Battle');
const Contest = require('../models/Contest');
const Activity = require('../models/Activity');
const axios = require('axios');
const logger = require('../utils/logger');
const { calculateEloRating } = require('../utils/rating');

// @desc    Submit code for evaluation
// @route   POST /api/submissions
// @access  Private
const submitCode = async (req, res) => {
  try {
    const { problemId, language, code, battleId, contestId } = req.body;

    // Validate problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Create submission
    const submission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      language,
      code,
      battle: battleId || null,
      contest: contestId || null,
      status: 'pending',
    });

    // Send to judge service for evaluation
    try {
      const judgeResponse = await axios.post(`${process.env.JUDGE_SERVICE_URL}/evaluate`, {
        submissionId: submission._id.toString(),
        problemId: problemId.toString(),
        language,
        code,
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
      });

      // Update submission with judge results
      submission.status = judgeResponse.data.status;
      submission.runtime = judgeResponse.data.runtime;
      submission.memory = judgeResponse.data.memory;
      submission.testCasesPassed = judgeResponse.data.testCasesPassed;
      submission.totalTestCases = judgeResponse.data.totalTestCases;
      submission.testResults = judgeResponse.data.testResults;
      submission.error = judgeResponse.data.error;
      await submission.save();

      // Update problem stats
      problem.stats.totalSubmissions += 1;
      if (submission.status === 'accepted') {
        problem.stats.acceptedSubmissions += 1;
        
        // Check if first time solving
        const previousAccepted = await Submission.findOne({
          user: req.user._id,
          problem: problemId,
          status: 'accepted',
          _id: { $ne: submission._id },
        });

        if (!previousAccepted) {
          problem.stats.totalSolved += 1;
          req.user.stats.problemsSolved += 1;
          await req.user.save();

          // Create activity
          await Activity.create({
            user: req.user._id,
            type: 'problem_solved',
            content: `Solved "${problem.title}" (${problem.difficulty})`,
            data: { problemId, difficulty: problem.difficulty },
          });
        }
      }
      await problem.save();

      // Handle battle submission
      if (battleId) {
        await handleBattleSubmission(submission, battleId, req.app.get('io'));
      }

      // Handle contest submission
      if (contestId) {
        await handleContestSubmission(submission, contestId, req.app.get('io'));
      }

      res.status(201).json({
        success: true,
        data: submission,
      });
    } catch (judgeError) {
      logger.error(`Judge service error: ${judgeError.message}`);
      submission.status = 'runtime_error';
      submission.error = 'Evaluation service error';
      await submission.save();
      
      res.status(500).json({ error: 'Code evaluation failed' });
    }
  } catch (error) {
    logger.error(`Submit code error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};

// Handle battle submission logic
const handleBattleSubmission = async (submission, battleId, io) => {
  const battle = await Battle.findById(battleId)
    .populate('challenger')
    .populate('opponent');

  if (!battle || battle.status !== 'in_progress') return;

  // Add submission to battle
  battle.submissions.push({
    user: submission.user,
    submittedAt: new Date(),
    status: submission.status,
    runtime: submission.runtime,
    memory: submission.memory,
  });

  // Check if this is first accepted solution
  if (submission.status === 'accepted' && !battle.winner) {
    battle.winner = submission.user;
    battle.status = 'completed';
    battle.endTime = new Date();

    // Calculate rating changes
    const isChallenger = battle.challenger._id.toString() === submission.user.toString();
    const winner = isChallenger ? battle.challenger : battle.opponent;
    const loser = isChallenger ? battle.opponent : battle.challenger;

    const ratingResult = calculateEloRating(winner.rating, loser.rating, 1);

    // Update ratings
    winner.rating = ratingResult.newRating1;
    winner.stats.wins += 1;
    winner.stats.totalBattles += 1;
    winner.updateRank();
    await winner.save();

    loser.rating = ratingResult.newRating2;
    loser.stats.losses += 1;
    loser.stats.totalBattles += 1;
    loser.updateRank();
    await loser.save();

    battle.ratingChange = {
      challenger: isChallenger ? ratingResult.change1 : ratingResult.change2,
      opponent: isChallenger ? ratingResult.change2 : ratingResult.change1,
    };

    // Emit battle completed event
    if (battle.challenger.socketId) {
      io.to(battle.challenger.socketId).emit('battle:completed', battle);
    }
    if (battle.opponent.socketId) {
      io.to(battle.opponent.socketId).emit('battle:completed', battle);
    }
  }

  await battle.save();
};

// Handle contest submission logic
const handleContestSubmission = async (submission, contestId, io) => {
  const contest = await Contest.findById(contestId);
  if (!contest || contest.status !== 'live') return;

  // Find participant
  const participant = contest.participants.find(
    (p) => p.user.toString() === submission.user.toString()
  );

  if (participant && submission.status === 'accepted') {
    // Check if first time solving this problem in contest
    const previousAccepted = await Submission.findOne({
      user: submission.user,
      problem: submission.problem,
      contest: contestId,
      status: 'accepted',
      _id: { $ne: submission._id },
    });

    if (!previousAccepted) {
      participant.problemsSolved += 1;
      
      // Find problem points
      const contestProblem = contest.problems.find(
        (p) => p.problem.toString() === submission.problem.toString()
      );
      if (contestProblem) {
        participant.score += contestProblem.points;
      }

      await contest.save();

      // Emit leaderboard update
      io.to(`contest:${contestId}`).emit('contest:leaderboard-update', {
        contestId,
        participant: {
          userId: participant.user,
          score: participant.score,
          problemsSolved: participant.problemsSolved,
        },
      });
    }
  }
};

// @desc    Get user submissions
// @route   GET /api/submissions/my-submissions
// @access  Private
const getUserSubmissions = async (req, res) => {
  try {
    const { problemId, status, page = 1, limit = 20 } = req.query;

    const query = { user: req.user._id };
    if (problemId) query.problem = problemId;
    if (status) query.status = status;

    const submissions = await Submission.find(query)
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Submission.countDocuments(query);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error(`Get submissions error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem')
      .populate('user', 'username');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check authorization
    if (submission.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    logger.error(`Get submission error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  submitCode,
  getUserSubmissions,
  getSubmissionById,
};
