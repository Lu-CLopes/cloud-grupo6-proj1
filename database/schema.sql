-- =====================================================================
-- CrossFit Tracker — Schema MySQL (VM3 - Banco de Dados)
-- Executado automaticamente pelo Vagrant na criação da VM
-- =====================================================================

CREATE DATABASE IF NOT EXISTS crossfit_tracker;
USE crossfit_tracker;

-- ── Usuários ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100)  NOT NULL,
    email          VARCHAR(150)  NOT NULL UNIQUE,
    password_hash  VARCHAR(255)  NOT NULL,
    created_at     DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ── WODs (treinos) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wods (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT           NOT NULL,
    title             VARCHAR(150)  NOT NULL,
    type              VARCHAR(50)   NOT NULL,
    focus             VARCHAR(50)   NOT NULL,
    description       TEXT          NOT NULL,
    result            VARCHAR(150),
    intensity         INT,
    fatigue           INT,
    notes             TEXT,
    hardest_exercise  VARCHAR(150),
    date              DATE          NOT NULL,
    created_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Execuções de exercício ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercise_entries (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    wod_id         INT,
    user_id        INT           NOT NULL,
    exercise_name  VARCHAR(100)  NOT NULL,
    weight         DECIMAL(6,2)  NOT NULL,
    reps           INT,
    sets           INT,
    date           DATE          NOT NULL,
    is_pr          TINYINT(1)    DEFAULT 0,
    notes          TEXT,
    created_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wod_id) REFERENCES wods(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Recordes pessoais (PRs) ──────────────────────────────────────────
-- Um registro por (usuário, exercício) — sempre reflete o maior peso já feito
CREATE TABLE IF NOT EXISTS personal_records (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT           NOT NULL,
    exercise_name  VARCHAR(100)  NOT NULL,
    best_weight    DECIMAL(6,2)  NOT NULL,
    achieved_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_exercise (user_id, exercise_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Índices de apoio às consultas mais frequentes ────────────────────
CREATE INDEX idx_wods_user      ON wods(user_id);
CREATE INDEX idx_entries_user   ON exercise_entries(user_id);
CREATE INDEX idx_entries_name   ON exercise_entries(exercise_name);
