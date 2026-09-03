const express = require('express');
const wodController = require('../controllers/wodController');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Funcionalidade #3 — Registro de um WOD (protegida por autenticação)
router.post('/wods', authenticate, asyncHandler(wodController.createWod));

module.exports = router;
