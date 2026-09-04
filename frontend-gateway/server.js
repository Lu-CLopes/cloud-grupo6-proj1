// Front-End Gateway (VM1).
// Não tem lógica de negócio nenhuma — só recebe as requisições do app
// mobile na rede externa e encaminha pra VM2 (App Server) na rede interna.
// É essa VM que fica exposta ao "mundo de fora" (Opção 2 da especificação).

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

const APP_SERVER_URL = process.env.APP_SERVER_URL || 'http://10.0.1.20:4000';

// Endpoint simples pra confirmar que o gateway está de pé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', role: 'frontend-gateway', forwardingTo: APP_SERVER_URL });
});

// Tudo que começar com /api é repassado pro App Server (VM2), sem alterações
app.use(
  '/api',
  createProxyMiddleware({
    target: APP_SERVER_URL,
    changeOrigin: true,
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Front-End Gateway rodando na porta ${PORT}, encaminhando /api -> ${APP_SERVER_URL}`);
});
