
import Database from '@tauri-apps/plugin-sql';


let db: Database | null = null;

export async function getDatabase() {
  if (!db) {
    db = await Database.load('sqlite:task-organiser.db');
  }

  return db;
}

export async function initialiseDatabase() {
  const database = await getDatabase();

  await database.execute(`
    CREATE TABLE IF NOT EXISTS workspaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    colour TEXT NOT NULL DEFAULT '#8B5CF6',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    task_type TEXT NOT NULL DEFAULT 'general'
        CHECK (task_type IN ('daily', 'weekly', 'monthly')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived INTEGER NOT NULL DEFAULT 0
        CHECK (archived IN (0, 1)),

    FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS task_recurrence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL UNIQUE,
    frequency TEXT NOT NULL
        CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    interval INTEGER NOT NULL DEFAULT 1
        CHECK (interval >= 1),
    start_date TEXT NOT NULL,
    end_date TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (task_id)
        REFERENCES tasks(id)
        ON DELETE CASCADE,

    CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS task_occurrences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo'
        CHECK (status IN ('todo', 'completed')),
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (task_id)
        REFERENCES tasks(id)
        ON DELETE CASCADE,

    UNIQUE (task_id, due_date),

    CHECK (
        (status = 'completed' AND completed_at IS NOT NULL)
        OR
        (status != 'completed' AND completed_at IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_tasks_workspace
    ON tasks(workspace_id);

CREATE INDEX IF NOT EXISTS idx_occurrences_due_date
    ON task_occurrences(due_date);

CREATE INDEX IF NOT EXISTS idx_occurrences_status_due
    ON task_occurrences(status, due_date);

CREATE INDEX IF NOT EXISTS idx_occurrences_task
    ON task_occurrences(task_id);
  `);
}
