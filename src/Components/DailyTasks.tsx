import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faRepeat, } from '@fortawesome/free-solid-svg-icons';

import '../styles/Tasks.css'


import {
    setTaskCompleted,
    deleteTask,
    type Task
} from '../services/TaskService';

export default function DailyTasks({ tasks }: { tasks: Task[] }) {
    
    return(
        <div className="daily-tasks-slot">
            {tasks.map((task) => (
            <div className="daily-task-box" key={task.occurrence_id}>
                <div className="daily-task-box-left">
                <input className="daily-task-checkbox" type="checkbox" checked={task.status === 'completed'}
                onChange={() => 
                setTaskCompleted(task.occurrence_id, (task.status != 'completed'))

                }></input>
                <div className={task.status === 'completed' ? "task-text-slot task-text-compleated": "task-text-slot "}>
                    <h1>{task.title}</h1> 
                    <p className="collections-text">{task.workspace_name}</p>
                </div>
                </div>
                <div className="daily-task-box-right">
                    <button className="repeat-daily-btn">
                        <FontAwesomeIcon icon={faRepeat} />
                        Daily
                    </button>

                    <button className="task-options-btn" type="button" aria-label="Task options" data-bs-toggle="menu" aria-expanded="false">
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>
                    <div className="menu">
                    <a className="menu-item" onClick={() => deleteTask(task.id)}>Delete task</a>
                    <a className="menu-item" href="#">Modify task</a>
                    </div>
                </div>
            </div>
            ))}
        </div>
    )
}