import {
    type Task
} from '../services/TaskService';

import '../styles/Statistic.css'

export default function TaskHistory({allTasks,
}: {
    allTasks: Task[];
}) {
    return(
        <div className="task-compleation-grid">
            {/* Column headings */}
            <div className="task-compleation-row task-compleation-header">
                <p>Task</p>
                <p>Type</p>
                <p>Due Date</p>
                <p>Completion Date</p>
                <p>Timing Status</p>
            </div>

            {/* Completed and outstanding task rows */}
            {allTasks.map(task => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const dueDate = new Date(task.due_date + "T00:00:00");
                const completionDate = task.completed_at
                ? new Date(task.completed_at).toLocaleDateString("en-GB")
                : "-";

                const completedOnTime =
                task.completed_at !== null &&
                task.completed_at.slice(0, 10) <= task.due_date;

                const isOverdue =
                    task.status === "todo" &&
                    dueDate < today;

                const displayDueDate = new Date(task.due_date + "T00:00:00").toLocaleDateString("en-GB");

                let timingStatus = "To Do";
                let timingClass = "task-to-do";

                if (task.status === "completed") {
                    timingStatus = completedOnTime ? "On Time" : "Late";
                    timingClass = completedOnTime
                        ? "completed-on-time"
                        : "completed-late";
                } else if (isOverdue) {
                    timingStatus = "Overdue";
                    timingClass = "task-overdue";
                }

                return (
                    <div
                        className="task-compleation-row"
                        key={task.occurrence_id}
                    >
                        <p>{task.title}</p>
                        <p>{task.task_type}</p>
                        <p>{displayDueDate}</p>
                        <p>{completionDate ?? "-"}</p>

                        <p className={timingClass}>
                            {timingStatus}
                        </p>
                    </div>
                );
            })}

            {allTasks.length === 0 && (
                <p className="task-compleation-empty">
                    No completed tasks yet.
                </p>
            )}

        </div>
    );
}