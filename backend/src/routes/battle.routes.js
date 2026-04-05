const express = require('express');
const { body } = require('express-validator');
const {
  createBattleChallenge,
  acceptBattleChallenge,
  declineBattleChallenge,
  getUserBattles,
  getBattleById,
} = require('../controllers/battle.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');
const router = express.Router();
const challengeValidation = [
  body('opponentId').isMongoId().withMessage('Invalid opponent ID'),
];
router.post('/challenge', protect, challengeValidation, validate, createBattleChallenge);
router.put('/:id/accept', protect, acceptBattleChallenge);
router.put('/:id/decline', protect, declineBattleChallenge);
router.get('/my-battles', protect, getUserBattles);
router.get('/:id', protect, getBattleById);
module.exports = router;
