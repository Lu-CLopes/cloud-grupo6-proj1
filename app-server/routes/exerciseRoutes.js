const express = require('express');
const exerciseController = require('../controllers/exerciseController');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Funcionalidade #4 — Registro de execução de exercício, com detecção de PR
// (protegida por autenticação)
router.post('/exercise-entries', authenticate, asyncHandler(exerciseController.createExerciseEntry));

module.exports = router;
