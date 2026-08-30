// Controller de histórico 

const wodModel = require('../models/wodModel');
const exerciseEntryModel = require('../models/exerciseEntryModel');

// ── GET /api/users/:id/history ────────────────────────────────────
async function getHistory(req, res) {
  const requestedId = Number(req.params.id);

  // Um usuário só pode ver o próprio histórico
  if (requestedId !== req.userId) {
    return res.status(403).json({ error: 'Você só pode consultar seu próprio histórico' });
  }

  const [wods, exerciseEntries] = await Promise.all([
    wodModel.findWodsByUser(requestedId),
    exerciseEntryModel.findHistoryByUser(requestedId),
  ]);

  res.json({ wods, exerciseEntries });
}

module.exports = { getHistory };
