// Model de execuções de exercício
// detectar automaticamente se uma nova execução bateu o recorde pessoal.

const pool = require('../db/pool');
const { upsertPersonalRecord, findPR } = require('./personalRecordModel');

// Registrar execução de exercício 
async function insertExerciseEntry(userId, entry) {
  const {
    exerciseName,
    weight,
    reps = null,
    sets = null,
    date,
    notes = null,
    wodId = null,
  } = entry;

  // Compara com o PR atual desse exercício para esse usuário
  const currentPR = await findPR(userId, exerciseName);
  const isPR = Number(weight) > Number(currentPR);

  const [result] = await pool.query(
    `INSERT INTO exercise_entries
       (wod_id, user_id, exercise_name, weight, reps, sets, date, is_pr, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [wodId, userId, exerciseName, weight, reps, sets, date, isPR ? 1 : 0, notes]
  );

  if (isPR) {
    await upsertPersonalRecord(userId, exerciseName, weight);
  }

  return {
    id: result.insertId,
    userId,
    exerciseName,
    weight,
    reps,
    sets,
    date,
    notes,
    wodId,
    isPR,
  };
}

// Histórico de execuções de um usuário 
async function findHistoryByUser(userId) {
  const [rows] = await pool.query(
    `SELECT
       ee.id, ee.exercise_name, ee.weight, ee.reps, ee.sets,
       ee.date, ee.is_pr, ee.notes, ee.wod_id,
       w.title AS wod_title
     FROM exercise_entries ee
     LEFT JOIN wods w ON w.id = ee.wod_id
     WHERE ee.user_id = ?
     ORDER BY ee.date DESC, ee.created_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = { insertExerciseEntry, findHistoryByUser };
