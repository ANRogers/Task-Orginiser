import { getDatabase } from './database';

export async function seedDatabase() {
  const db = await getDatabase();

  // Prevent inserting the dummy data more than once.
  const existing = await db.select<{ count: number }[]>(
    'SELECT COUNT(*) AS count FROM workspaces'
  );

  if (existing[0].count > 0) {
    console.log('Dummy data already exists.');
    return;
  }

  // Workspaces
  await db.execute(`
    INSERT OR IGNORE INTO workspaces (name, colour) VALUES
    ('Personal', '#8B5CF6'),
    ('Work', '#06B6D4'),
    ('Fitness', '#10B981'),
    ('Projects', '#F59E0B');
  `);

  // Tasks
  await db.execute(`
    INSERT INTO tasks (workspace_id, title, description, task_type) VALUES
      (1, 'Clean bedroom', 'Tidy up and vacuum the bedroom', 'daily'),
      (1, 'Read for 30 minutes', 'Read a book before bed', 'daily'),
      (1, 'Do the washing', 'Wash and put away clothes', 'weekly'),
      (1, 'Sort out paperwork', 'Organise important documents', 'monthly'),
      (2, 'Review pull requests', 'Check outstanding code changes', 'daily'),
      (2, 'Update documentation', 'Document recent code changes', 'weekly'),
      (2, 'Plan next sprint', 'Prepare tasks for the next sprint', 'weekly'),
      (3, 'Morning workout', 'Complete a short workout', 'daily'),
      (3, 'Go for a run', 'Run for at least 20 minutes', 'weekly'),
      (3, 'Review fitness progress', 'Check progress and update goals', 'monthly'),
      (4, 'Improve dashboard', 'Polish the task dashboard UI', 'weekly'),
      (4, 'Test database operations', 'Test task creation and deletion', 'daily'),
      (4, 'Review project structure', 'Clean up code and file organisation', 'monthly');
  `);

  // Recurring task rules.
  // These dates are examples for testing.
  await db.execute(`
    INSERT INTO task_recurrence
      (task_id, frequency, interval, start_date)
    VALUES
      (1, 'daily', 1, '2026-01-01'),
      (2, 'daily', 1, '2026-01-01'),
      (3, 'weekly', 1, '2026-01-01'),
      (4, 'monthly', 1, '2026-01-01'),
      (5, 'daily', 1, '2026-01-01'),
      (6, 'weekly', 1, '2026-01-01'),
      (7, 'weekly', 1, '2026-01-01'),
      (8, 'daily', 1, '2026-01-01'),
      (9, 'weekly', 1, '2026-01-01'),
      (10, 'monthly', 1, '2026-01-01'),
      (11, 'weekly', 1, '2026-01-01'),
      (12, 'daily', 1, '2026-01-01'),
      (13, 'monthly', 1, '2026-01-01');
  `);

  // Individual task occurrences for the current date.
  // Includes completed and incomplete tasks.
  await db.execute(`
    INSERT INTO task_occurrences
      (task_id, due_date, status, completed_at)
    VALUES
      (1, '2026-10-17', 'completed', CURRENT_TIMESTAMP),
      (2, '2026-10-17', 'todo', NULL),
      (3, '2026-10-17', 'todo', NULL),
      (5, '2026-10-17', 'completed', CURRENT_TIMESTAMP),
      (8, '2026-10-17', 'todo', NULL),
      (11, '2026-10-17', 'todo', NULL),
      (12, '2026-10-17', 'todo', NULL);

    INSERT INTO task_occurrences
      (task_id, due_date, status, completed_at)
    VALUES
      (3, '2026-10-10', 'todo', NULL),
      (6, '2026-10-11', 'completed', CURRENT_TIMESTAMP),
      (9, '2026-10-12', 'todo', NULL),
      (4, '2026-10-01', 'todo', NULL),
      (7, '2026-10-20', 'todo', NULL),
      (10, '2026-11-01', 'todo', NULL);
  `);

  console.log('Dummy data inserted successfully!');
}