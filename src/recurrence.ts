import { getDatabase } from "./database";

export async function scheduleTask(
  task_id: number,
  dueDate: string
): Promise<void> {
  const db = await getDatabase();

  await db.execute(
    `INSERT OR IGNORE INTO task_occurrences (
      task_id,
      status,
      due_date
    )
    VALUES (?, 'todo', ?)`,
    [task_id, dueDate]
  );
}

export async function generateOccurrences(): Promise<void> {
  const db = await getDatabase();

  const today = new Date();
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");

  //get the next occurance from data given
  function getNextOccuranceDueDate(
    lastDate: string,
    interval: number,
    taskType: string
  ): Date {
    const [year, month, day] = lastDate.split("-").map(Number);

    const nextDate = new Date(year, month - 1, day);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    // Loop until the date is today or in the future.
    do {
      switch (taskType) {
        case "daily":
          nextDate.setDate(nextDate.getDate() + interval);
          break;

        case "weekly":
          nextDate.setDate(nextDate.getDate() + (7 * interval));
          break;

        case "monthly": {
          const originalDay = nextDate.getDate();

          nextDate.setDate(1);
          nextDate.setMonth(nextDate.getMonth() + interval);

          const lastDay = new Date(
            nextDate.getFullYear(),
            nextDate.getMonth() + 1,
            0
          ).getDate();

          nextDate.setDate(Math.min(originalDay, lastDay));
          break;
        }

        default:
          throw new Error(`Invalid task type: ${taskType}`);
      }
    } while (nextDate < today);

    return nextDate;
  }

  // Find active tasks that repeat.
  const tasks = await db.select<{
    id: number;
    task_type: string;
    start_date: string;
    repeat_interval: number;
  }[]>(`
    SELECT
      t.id,
      t.task_type,
      r.start_date,
      r."interval" AS repeat_interval
    FROM tasks AS t
    JOIN task_recurrence AS r
      ON t.id = r.task_id
    WHERE t.archived = 0
      AND t.task_type IN ('daily', 'weekly', 'monthly')
  `);

  for (const task of tasks) {
    // Find occurrences due today or later.
    const occurrences = await db.select<{
      due_date: string;
    }[]>(`
      SELECT due_date
      FROM task_occurrences
      WHERE task_id = ?
        AND due_date >= ?
      ORDER BY due_date ASC
    `, [task.id, todayString]);

    // We already have today's/next and upcoming occurrences.
    if (occurrences.length >= 2) {
      continue;
    }

    // Find the latest occurrence, including past ones.
    const rows = await db.select<{
      due_date: string;
    }[]>(`
      SELECT due_date
      FROM task_occurrences
      WHERE task_id = ?
      ORDER BY due_date DESC
      LIMIT 1
    `, [task.id]);

    let lastDate = rows.length > 0
      ? rows[0].due_date
      : task.start_date;

    // Generate enough occurrences to have two from today onwards.
    while (occurrences.length < 2) {
      const nextDate = getNextOccuranceDueDate(
        lastDate,
        task.repeat_interval,
        task.task_type
      );

      const nextDateString = [
        nextDate.getFullYear(),
        String(nextDate.getMonth() + 1).padStart(2, "0"),
        String(nextDate.getDate()).padStart(2, "0")
      ].join("-");

      await scheduleTask(task.id, nextDateString);

      // Update the date so the next iteration advances again.
      lastDate = nextDateString;

      // Update the count so the loop eventually stops.
      occurrences.push({ due_date: nextDateString });
    }
  }
    

    //this is returning what should be the next date until today or further even if there is one already made
    //next we need to check to see if

    //get the occurances from today onwards
    //check if there are more than 1 if yes return as all made
    //if there are none from today onwards make one for the next squadualed time baised either from the last occurance or the start date
    //if passed create a new occurance that is what should be the next squedualed date e.g. if daily set one today
    //find out when the next occurance should be and create it
    //should be done?
  }
