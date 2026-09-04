import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('crossfit.db');

export function getDb() {
  return db;
}

export async function initDatabase(): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS wods (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      date        TEXT    NOT NULL,
      title       TEXT    NOT NULL,
      type        TEXT    NOT NULL,
      focus       TEXT    NOT NULL,
      description TEXT    NOT NULL,
      result      TEXT,
      intensity   INTEGER,
      fatigue     INTEGER,
      notes       TEXT,
      hardest_exercise TEXT,
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exercise_entries (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      weight      REAL    NOT NULL,
      reps        INTEGER,
      date        TEXT    NOT NULL,
      is_pr       INTEGER DEFAULT 0,
      wod_id      INTEGER REFERENCES wods(id) ON DELETE SET NULL,
      notes       TEXT,
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('bar_type', 'male');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('weight_unit', 'lb');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('openai_key', '');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('theme_mode', 'dark');
  `);

  console.log('✅ Banco iniciado');
}