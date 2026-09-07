// App Server (VM2).
// Monta o Express app com as rotas de negócio (funcionalidades 1-5) e
// expõe a API consumida pelo Front-End Gateway (VM1) via rede interna.

const express = require('express');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const wodRoutes = require('./routes/wodRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');

const app = express();
app.use(express.json());

// Endpoint simples pra confirmar que a API está de pé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', role: 'app-server' });
});

app.use('/api', userRoutes);
app.use('/api', wodRoutes);
app.use('/api', exerciseRoutes);

// Middleware de erro — garante resposta em JSON mesmo quando um controller
// lança uma exceção (ex.: falha de conexão com o banco), em vez do HTML
// padrão do Express.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`App Server rodando na porta ${PORT}`);
});
