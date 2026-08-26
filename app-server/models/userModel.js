// Toda a lógica de acesso à tabela `users` 

const bcrypt = require('bcryptjs');
const pool = require('../db/pool');

const SALT_ROUNDS = 10;

// Criar novo usuário
async function createUser({ name, email, password }) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query(
        `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
        [name, email, passwordHash]
    );

    return { id: result.insertId, name, email };
}

// Buscar usuário por email
async function findByEmail(email) {
    const [rows] = await pool.query(
        `SELECT * FROM users WHERE email = ?`,
        [email]
    );
    return rows[0] || null;
}

// Buscar usuário por id 
async function findById(id) {
    const [rows] = await pool.query(
        `SELECT id, name, email, created_at FROM users WHERE id = ?`,
        [id]
    );
    return rows[0] || null;
}

// Verificar senha no login 
async function verifyPassword(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
}

module.exports = { createUser, findByEmail, findById, verifyPassword };
