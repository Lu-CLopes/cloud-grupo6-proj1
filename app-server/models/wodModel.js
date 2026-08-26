// Model de WODs (treinos).

const pool = require('../db/pool');

// Registrar um novo WOD 
async function insertWod(userId, wod) {
    const {
        title,
        type,
        focus,
        description,
        result = null,
        intensity = null,
        fatigue = null,
        notes = null,
        hardestExercise = null,
        date,
    } = wod;

    const [insertResult] = await pool.query(
        `INSERT INTO wods
       (user_id, title, type, focus, description, result,
        intensity, fatigue, notes, hardest_exercise, date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, title, type, focus, description, result,
            intensity, fatigue, notes, hardestExercise, date]
    );

    return { id: insertResult.insertId, userId, ...wod };
}

// Histórico de WODs de um usuário 
async function findWodsByUser(userId) {
    const [rows] = await pool.query(
        `SELECT * FROM wods WHERE user_id = ? ORDER BY date DESC, created_at DESC`,
        [userId]
    );
    return rows;
}

module.exports = { insertWod, findWodsByUser };
