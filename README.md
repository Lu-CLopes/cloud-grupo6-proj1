# CrossFit Tracker — Projeto 1 (Computação em Nuvem)

## 1. Introdução

Este projeto consiste no desenvolvimento de um ambiente de nuvem para hospedar o backend do **CrossFit Tracker**, uma aplicação para registro de treinos (WODs), acompanhamento de exercícios e controle de recordes pessoais (PRs) em CrossFit.

## 2. Objetivo

Implementar um ambiente de nuvem com no mínimo 3 VMs, contendo:

- Uma VM de **Front-End**, responsável por receber as requisições da aplicação cliente;
- Uma VM de **App Server**, responsável pela lógica de negócio e pelos endpoints da API;
- Uma VM de **Banco de Dados**, responsável por persistir os dados da aplicação.

Como caso de uso, será implementado um conjunto inicial de 5 funcionalidades/chamadas de API integradas ao banco de dados, cobrindo o fluxo essencial da aplicação: cadastro de usuário, login, registro de treino, registro de exercício executado (com detecção de recorde pessoal) e consulta de histórico.

## 3. Arquitetura da Solução

Optou-se pela **Opção 2 (Sem Proxy Reverso)**, por reduzir a complexidade de configuração mantendo a separação exigida entre rede externa, rede interna e as camadas da aplicação.

### 3.1 Componentes

| VM | Papel | Tecnologia |
|---|---|---|
| VM1 | Front-End (Webserver) | Node.js / Express |
| VM2 | App Server / API | Node.js / Express |
| VM3 | Banco de Dados | MySQL |

O cliente da aplicação é um aplicativo mobile (React Native + Expo) que consome os endpoints expostos pela VM1, que por sua vez encaminha as requisições para a VM2 processar a lógica de negócio e acessar o banco de dados na VM3.

## 4. Funcionalidades / Chamadas de API (Escopo Inicial — 5)

| # | Funcionalidade | Endpoint | Tabelas envolvidas |
|---|---|---|---|
| 1 | Cadastro de usuário | `POST /api/users` | `users` |
| 2 | Login do usuário | `POST /api/auth/login` | `users` |
| 3 | Registro de um WOD (treino) | `POST /api/wods` | `wods` |
| 4 | Registro de execução de exercício (com detecção automática de PR) | `POST /api/exercise-entries` | `exercise_entries`, `personal_records` |
| 5 | Consulta do histórico de treinos do usuário | `GET /api/users/:id/history` | `wods`, `exercise_entries` |

Cada endpoint realiza uma operação real de escrita ou leitura no MySQL hospedado na VM3, validando o fluxo completo: **App Mobile → Front-End (VM1) → API (VM2) → Banco de Dados (VM3)**.

## 5. Modelo de Dados

```sql
users (id, name, email, password_hash, created_at)
wods (id, user_id, name, date, notes, created_at)
exercise_entries (id, wod_id, exercise_name, weight, reps, sets, created_at)
personal_records (id, user_id, exercise_name, best_weight, achieved_at)
```

## 6. Tecnologias Utilizadas

- **Infraestrutura:** 3 VMs Linux (Ubuntu), rede virtual externa e interna segregadas
- **Front-End (Webserver):** Node.js + Express
- **App Server / API:** Node.js + Express
- **Banco de Dados:** MySQL
- **Cliente:** Aplicativo mobile em React Native + Expo
- **Controle de versão:** Git/GitHub (repositório compartilhado do grupo)

## 7. Equipe

Luiza Lopes 
Maria Manzini
Rafael Ramos 
