// Controller de usuários 

const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { isNonEmptyString, isValidEmail } = require('../utils/validate');
const { JWT_SECRET } = require('../middleware/auth');

// ── POST /api/users ────────────────────────────────────────────────
async function register(req, res) {
  const { name, email, password } = req.body;

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: 'name é obrigatório' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'email inválido' });
  }
  if (!isNonEmptyString(password) || password.length < 6) {
    return res.status(400).json({ error: 'password deve ter ao menos 6 caracteres' });
  }

  const existing = await userModel.findByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'Já existe um usuário com esse email' });
  }

  const user = await userModel.createUser({ name, email, password });
  res.status(201).json(user);
}

// ── POST /api/auth/login ──────────────────────────────────────────
async function login(req, res) {
  const { email, password } = req.body;

  if (!isValidEmail(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'email e password são obrigatórios' });
  }

  const user = await userModel.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const passwordMatches = await userModel.verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

module.exports = { register, login };
