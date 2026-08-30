// Controller de WODs 

const wodModel = require('../models/wodModel');
const { isNonEmptyString, isValidDate } = require('../utils/validate');

// ── POST /api/wods ─────────────────────────────────────────────────
async function createWod(req, res) {
  const {
    title, type, focus, description, date,
    result, intensity, fatigue, notes, hardestExercise,
  } = req.body;

  if (!isNonEmptyString(title)) return res.status(400).json({ error: 'title é obrigatório' });
  if (!isNonEmptyString(type)) return res.status(400).json({ error: 'type é obrigatório' });
  if (!isNonEmptyString(focus)) return res.status(400).json({ error: 'focus é obrigatório' });
  if (!isNonEmptyString(description)) return res.status(400).json({ error: 'description é obrigatório' });
  if (!isValidDate(date)) return res.status(400).json({ error: 'date deve estar no formato YYYY-MM-DD' });

  const wod = await wodModel.insertWod(req.userId, {
    title, type, focus, description, date,
    result, intensity, fatigue, notes, hardestExercise,
  });

  res.status(201).json(wod);
}

module.exports = { createWod };
