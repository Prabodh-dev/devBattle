const express = require('express');
const { getProblems, getProblemById, getProblemTestCases } = require('../controllers/problem.controller');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, getProblems);
router.get('/:id', optionalAuth, getProblemById);
router.get('/:id/testcases', getProblemTestCases);

module.exports = router;
