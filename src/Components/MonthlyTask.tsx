


import {
    type Task
} from '../services/TaskService';
import '../styles/Tasks.css'

export default function MonthlyTask({ task }: { task: Task[] }) {

    if (!task || task.length === 0) {
        return null;
    }

    const dueDate = new Date(task[0].due_date);

    return (
        <div className="monthly-task">
            <div className="monthly-task-date">
                <p className="monthly-task-date-text">
                    {dueDate.toLocaleDateString("en-GB", {
                        month: "short",
                    })}
                </p>

                <p className="monthly-task-date-text">
                    {dueDate.toLocaleDateString("en-GB", {
                        day: "numeric",
                    })}
                </p>
            </div>

            <div className="next-monthly-task-text">
                <p>Next Monthly Task</p>
                <h1>{task[0].title}</h1>
            </div>
        </div>
    );
}
