// Controller de execuções de exercício 

const exerciseEntryModel = require('../models/exerciseEntryModel');
const { isNonEmptyString, isPositiveNumber, isValidDate } = require('../utils/validate');

// ── POST /api/exercise-entries ────────────────────────────────────
async function createExerciseEntry(req, res) {
  const { exerciseName, weight, reps, sets, date, notes, wodId } = req.body;

  if (!isNonEmptyString(exerciseName)) {
    return res.status(400).json({ error: 'exerciseName é obrigatório' });
  }
  if (!isPositiveNumber(weight)) {
    return res.status(400).json({ error: 'weight deve ser um número positivo' });
  }
  if (!isValidDate(date)) {
    return res.status(400).json({ error: 'date deve estar no formato YYYY-MM-DD' });
  }

  const entry = await exerciseEntryModel.insertExerciseEntry(req.userId, {
    exerciseName, weight, reps, sets, date, notes, wodId,
  });

  res.status(201).json(entry);
}

module.exports = { createExerciseEntry };
