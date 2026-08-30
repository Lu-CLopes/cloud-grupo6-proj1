// Model de recordes pessoais (PRs)

const pool = require('../db/pool');

// Cria ou atualiza o PR de um exercício 
async function upsertPersonalRecord(userId, exerciseName, weight) {
  await pool.query(
    `INSERT INTO personal_records (user_id, exercise_name, best_weight, achieved_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       best_weight = VALUES(best_weight),
       achieved_at = VALUES(achieved_at)`,
    [userId, exerciseName, weight]
  );
}

// Busca o PR atual de um exercício específico 
async function findPR(userId, exerciseName) {
  const [rows] = await pool.query(
    `SELECT best_weight FROM personal_records WHERE user_id = ? AND exercise_name = ?`,
    [userId, exerciseName]
  );
  return rows[0]?.best_weight ?? 0;
}

// Lista todos os PRs de um usuário 
async function findAllByUser(userId) {
  const [rows] = await pool.query(
    `SELECT exercise_name, best_weight, achieved_at
     FROM personal_records
     WHERE user_id = ?
     ORDER BY exercise_name ASC`,
    [userId]
  );
  return rows;
}

module.exports = { upsertPersonalRecord, findPR, findAllByUser };
