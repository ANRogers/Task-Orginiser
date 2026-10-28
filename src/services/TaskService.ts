
import { getDatabase } from '../database';

// Types returned by the database

export interface Task {
  id: number;
  occurrence_id: number;
  recurrence_id: number | null;
  title: string;
  description: string | null;
  workspace_id: number;
  workspace_name: string;
  workspace_colour: string;
  task_type: 'daily' | 'weekly' | 'monthly';
  status: 'todo' | 'completed';
  due_date: string;
  completed_at: string | null;
}

// tasks for display not with duedates
export interface DisplayTask {
  id: number;
  recurrence_id: number | null;
  title: string;
  description: string | null;
  workspace_id: number;
  workspace_name: string;
  workspace_colour: string;
  task_type: 'daily' | 'weekly' | 'monthly';
  completed_at: string | null;
}

// Get today's date in local time as YYYY-MM-DD.
// Avoids using toISOString(), which converts to UTC.
function getLocalDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getLocalDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Get tasks scheduled for today

export async function getTodaysDailyTasks(): Promise<Task[]> {
  const db = await getDatabase();
  const today = getLocalDate();

  return db.select<Task[]>(`
    SELECT
      t.id,
      o.id AS occurrence_id,
      r.id AS recurrence_id,
      t.title,
      t.description,
      t.workspace_id,
      w.name AS workspace_name,
      w.colour AS workspace_colour,
      t.task_type,
      o.status,
      o.due_date,
      o.completed_at
    FROM task_occurrences AS o
    JOIN tasks AS t ON t.id = o.task_id
    JOIN workspaces AS w ON w.id = t.workspace_id
    LEFT JOIN task_recurrence AS r ON r.task_id = t.id
    WHERE t.archived = 0
      AND t.task_type = 'daily'
      AND o.due_date = ?
    ORDER BY t.title COLLATE NOCASE
  `, [today]);
}

export async function getTodaysWeeklyTasks(): Promise<Task[]> {
  const db = await getDatabase();
  const today = getLocalDate();
  const nextWeek = getLocalDateOffset(7);

  return db.select<Task[]>(`
    SELECT
      t.id,
      o.id AS occurrence_id,
      r.id AS recurrence_id,
      t.title,
      t.description,
      t.workspace_id,
      w.name AS workspace_name,
      w.colour AS workspace_colour,
      t.task_type,
      o.status,
      o.due_date,
      o.completed_at
    FROM task_occurrences AS o
    JOIN tasks AS t ON t.id = o.task_id
    JOIN workspaces AS w ON w.id = t.workspace_id
    LEFT JOIN task_recurrence AS r ON r.task_id = t.id
    WHERE t.archived = 0
      AND o.due_date BETWEEN ? AND ?
      AND t.task_type = 'weekly'
    ORDER BY o.due_date ASC
  `, [today, nextWeek]);
}

export async function getTodaysMonthlyTasks(): Promise<Task[]> {
  const db = await getDatabase();
  const today = getLocalDate();
  const nextMonth = getLocalDateOffset(31);

  return db.select<Task[]>(`
    SELECT
      t.id,
      o.id AS occurrence_id,
      r.id AS recurrence_id,
      t.title,
      t.description,
      t.workspace_id,
      w.name AS workspace_name,
      w.colour AS workspace_colour,
      t.task_type,
      o.status,
      o.due_date,
      o.completed_at
    FROM task_occurrences AS o
    JOIN tasks AS t ON t.id = o.task_id
    JOIN workspaces AS w ON w.id = t.workspace_id
    LEFT JOIN task_recurrence AS r ON r.task_id = t.id
    WHERE t.archived = 0
      AND t.task_type = 'monthly'
      AND o.due_date BETWEEN ? AND ?
    ORDER BY o.due_date ASC
  `, [today, nextMonth]);
}

export async function getOverdueTasks(): Promise<Task[]> {
  const db = await getDatabase();
  const today = getLocalDate();

  return db.select<Task[]>(`
    SELECT
      t.id,
      o.id AS occurrence_id,
      r.id AS recurrence_id,
      t.title,
      t.description,
      t.workspace_id,
      w.name AS workspace_name,
      w.colour AS workspace_colour,
      t.task_type,
      o.status,
      o.due_date,
      o.completed_at
    FROM task_occurrences AS o
    JOIN tasks AS t ON t.id = o.task_id
    JOIN workspaces AS w ON w.id = t.workspace_id
    LEFT JOIN task_recurrence AS r ON r.task_id = t.id
    WHERE t.archived = 0
      AND o.due_date < ?
      AND o.status != 'completed'
    ORDER BY o.due_date ASC
  `, [today]);
}

export async function getUpcommingTasks(): Promise<Task[]> {
  const db = await getDatabase();
  const upcomming = getLocalDateOffset(1);

  return db.select<Task[]>(`
    SELECT
      t.id,
      o.id AS occurrence_id,
      r.id AS recurrence_id,
      t.title,
      t.description,
      t.workspace_id,
      w.name AS workspace_name,
      w.colour AS workspace_colour,
      t.task_type,
      o.status,
      o.due_date,
      o.completed_at
    FROM task_occurrences AS o
    JOIN tasks AS t ON t.id = o.task_id
    JOIN workspaces AS w ON w.id = t.workspace_id
    LEFT JOIN task_recurrence AS r ON r.task_id = t.id
    WHERE t.archived = 0
      AND o.due_date = ?
    ORDER BY o.due_date ASC
  `, [upcomming]);
}


// Displaying all task definitions

export async function getDailyTasks(): Promise<DisplayTask[]> {
  const db = await getDatabase();

  return db.select<DisplayTask[]>(`
    SELECT
      t.id,
      r.id AS recurrence_id,
      t.title,
      t.description,
      t.workspace_id,
      w.name AS workspace_name,
      w.colour AS workspace_colour,
      t.task_type,
      t.created_at
    FROM tasks AS t
    JOIN workspaces AS w ON w.id = t.workspace_id
    LEFT JOIN task_recurrence AS r ON r.task_id = t.id
    WHERE t.archived = 0
      AND t.task_type = 'daily'
    ORDER BY t.title COLLATE NOCASE
  `);
}

export async function getWeeklyTasks(): Promise<DisplayTask[]> {
  const db = await getDatabase();

  return db.select<DisplayTask[]>(`
    SELECT
      t.id,
      r.id AS recurrence_id,
      t.title,
      t.description,
      t.workspace_id,
      w.name AS workspace_name,
      w.colour AS workspace_colour,
      t.task_type,
      t.created_at
    FROM tasks AS t
    JOIN workspaces AS w ON w.id = t.workspace_id
    LEFT JOIN task_recurrence AS r ON r.task_id = t.id
    WHERE t.archived = 0
      AND t.task_type = 'weekly'
    ORDER BY t.title COLLATE NOCASE
  `);
}

export async function getMonthlyTask(): Promise<DisplayTask[]> {
  const db = await getDatabase();

  return db.select<DisplayTask[]>(`
    SELECT
      t.id,
      r.id AS recurrence_id,
      t.title,
      t.description,
      t.workspace_id,
      w.name AS workspace_name,
      w.colour AS workspace_colour,
      t.task_type,
      t.created_at
    FROM tasks AS t
    JOIN workspaces AS w ON w.id = t.workspace_id
    LEFT JOIN task_recurrence AS r ON r.task_id = t.id
    WHERE t.archived = 0
      AND t.task_type = 'monthly'
    ORDER BY t.title ASC
  `);
}

export async function getArchivedTasks(): Promise<DisplayTask[]> {
  const db = await getDatabase();


  return db.select<DisplayTask[]>(
    `
    SELECT
      t.id,
      t.title,
      t.description,
      t.workspace_id,
      w.name AS workspace_name,
      w.colour AS workspace_colour,
      t.task_type,
      t.created_at
    FROM tasks AS t
    JOIN workspaces AS w ON w.id = t.workspace_id
    WHERE t.archived = 1
    ORDER BY t.title ASC
    `,

  );
}

// Mark a task occurrence as completed or incomplete
export async function setTaskCompleted(
  occurrenceId: number,
  completed: boolean
): Promise<void> {
  const db = await getDatabase();

  await db.execute(
    `
    UPDATE task_occurrences
    SET
      status = $1,
      completed_at = $2
    WHERE id = $3
    `,
    [
      completed ? 'completed' : 'todo',
      completed ? new Date().toISOString() : null,
      occurrenceId
    ]
  );
}

export async function addTask(title: string, description: string, workspace_id: number, taskType: string, dueDate: string) {
  const db = await getDatabase();

  //add data to task table and get back id
  const result = await db.select<{ id: number }[]>(
      `INSERT INTO tasks (
          title,
          description,
          workspace_id,
          task_type,
          archived
      )
      VALUES ($1, $2, $3, $4, 0)
      RETURNING id`,
      [title, description, workspace_id, taskType]
  );

  const task_id = result[0]?.id;

  //use id to add due day to task_occurrenes
  await db.execute(
    `INSERT INTO task_occurrences( task_id,
    status,
    due_date
  )
  VALUES ($1, 'todo', $2)`,
  [task_id,dueDate]
  );
}

export async function scheduleTask(task_id: number, dueDate: string) {
  const db = await getDatabase();

  
  //use id to add due day to add new task_occurrenes
  await db.execute(
    `INSERT OR IGNORE INTO task_occurrences( task_id,
    status,
    due_date
  )
  VALUES ($1, 'todo', $2)`,
  [task_id,dueDate]
  );
}

export async function editTask(
    task_id: number,
    occurrence_id: number,
    title: string,
    description: string,
    workspace_id: number,
    taskType: string,
    dueDate: string
) {
    const db = await getDatabase();

    // Update the existing task
    await db.execute(
        `UPDATE tasks
         SET title = $1,
             description = $2,
             workspace_id = $3,
             task_type = $4
         WHERE id = $5`,
        [title, description, workspace_id, taskType, task_id]
    );

    // Update the existing occurrence's due date
    await db.execute(
        `UPDATE task_occurrences
         SET due_date = $1
         WHERE id = $2 AND task_id = $3`,
        [dueDate, occurrence_id, task_id]
    );
}

export async function editDisplayTask(
    task_id: number,
    title: string,
    description: string,
    workspace_id: number,
    taskType: string,
) {
    const db = await getDatabase();

    // Update the existing task
    await db.execute(
        `UPDATE tasks
         SET title = $1,
             description = $2,
             workspace_id = $3,
             task_type = $4
         WHERE id = $5`,
        [title, description, workspace_id, taskType, task_id]
    );
}

export async function addRepeat(task_id:number, task_type: string, repeat_interval: number, due_date: string) {
  const db = await getDatabase();

  
  //create a repeat if it dosent exsist
  await db.execute(
    `INSERT OR IGNORE INTO task_recurrence( task_id,
    frequency,
    interval,
    start_date
  )
  VALUES ($1, $2, $3, $4)`,
  [task_id,task_type, repeat_interval, due_date ]
  );
}

export async function removeRepeat(task_id:number) {
  const db = await getDatabase();

  
  //remove a repeat
  await db.execute(
    `DELETE FROM task_recurrence WHERE task_id = $1`,
  [task_id,]
  );
}

export async function archiveTask(taskId: number): Promise<void>{
    const db = await getDatabase();

    await db.execute(
        'UPDATE tasks SET archived = 1 WHERE id = $1',
        [taskId]
    )
    
}

export async function unarchiveTask(taskId: number): Promise<void>{
    const db = await getDatabase();

    await db.execute(
        'UPDATE tasks SET archived = 0 WHERE id = $1',
        [taskId]
    )
    
}

export async function deleteTask(taskId: number): Promise<void>{
    const db = await getDatabase();

    await db.execute(
        'DELETE FROM task_occurrences WHERE task_id = $1',
        [taskId]
    )

    await db.execute(
        'DELETE FROM task_recurrence WHERE task_id = $1',
        [taskId]
    );


    await db.execute(
        'DELETE FROM tasks WHERE id = $1',
        [taskId]
    )
    
}