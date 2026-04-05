const express = require('express');
const { body } = require('express-validator');
const {
  submitCode,
  getUserSubmissions,
  getSubmissionById,
} = require('../controllers/submission.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');
const router = express.Router();
const submissionValidation = [
  body('problemId').isMongoId().withMessage('Invalid problem ID'),
  body('language').isIn(['python', 'javascript', 'java', 'cpp', 'c']).withMessage('Invalid language'),
  body('code').notEmpty().withMessage('Code is required'),
];
router.post('/', protect, submissionValidation, validate, submitCode);
router.get('/my-submissions', protect, getUserSubmissions);
router.get('/:id', protect, getSubmissionById);
module.exports = router;
