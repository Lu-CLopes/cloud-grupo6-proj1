const express = require('express');
const userController = require('../controllers/userController');
const historyController = require('../controllers/historyController');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Funcionalidade #1 — Cadastro de usuário
router.post('/users', asyncHandler(userController.register));

// Funcionalidade #2 — Login do usuário
router.post('/auth/login', asyncHandler(userController.login));

// Funcionalidade #5 — Histórico do usuário (protegida por autenticação)
router.get('/users/:id/history', authenticate, asyncHandler(historyController.getHistory));

module.exports = router;
