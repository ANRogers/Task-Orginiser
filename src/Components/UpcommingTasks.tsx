import { Link } from 'react-router-dom';
import {
    setTaskCompleted,
    deleteOccurrence,
    archiveTask,
    type Task
} from '../services/TaskService';
import '../styles/Tasks.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faEllipsisVertical, } from '@fortawesome/free-solid-svg-icons';

export default function UpcommingTasks({    tasks,
    reloadTasks,
    onEditTask
}: {
    tasks: Task[];
    reloadTasks: () => Promise<void>;
    onEditTask: (task: Task) => void;
}) {
    
    

    
    
    //  t.id,
    //   o.id AS occurrence_id,
    //   t.title,
    //   t.description,
    //   t.workspace_id,
    //   w.name AS workspace_name,
    //   t.task_type,
    //   o.status,
    //   o.due_date,
    //   o.completed_at
   

    
    
    return(
        <div className="side-bar-tasks-slot">
        <div className="side-bar-tasks-scroll">
        {tasks.map((task) => (
        
        <div className="side-bar-task-box up-next-box" key={task.occurrence_id}>
            <input className="daily-task-checkbox" type="checkbox"checked={task.status === 'completed'}
                onChange={async () => {
                    await setTaskCompleted(
                        task.occurrence_id,
                        task.status !== 'completed'
                    );

                    await reloadTasks();
                }}></input>
            <div className={task.status === 'completed' ? "task-text-slot task-text-compleated": "task-text-slot "}>
                <h1>{task.title}</h1>
                <div className="side-bar-task-info">
                <p className="collections-text" style={{color: task.workspace_colour}}>{task.workspace_name}</p>
                <p className="collections-text"> · </p>
                <p className="collections-text">{task.task_type}</p>
                </div>
            </div>
            

            
            <div className="task-options-slot">
                <button
                    className="task-options-btn"
                    type="button"
                    aria-label="Task options"
                    data-bs-toggle="menu"
                    aria-expanded="false"
                >
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>

                <div className="menu task-menu">
                    <a className="menu-item task-menu-item" onClick={async () => {
                        await archiveTask(task.id);
                        await reloadTasks();
                    }}>Archive task</a>

                    <a className="menu-item task-menu-item" onClick={async () => {
                        await onEditTask(task);
                    }}>Modify task</a>

                    <a className="menu-item task-menu-item-delete" onClick={async () => {
                        await deleteOccurrence(task.occurrence_id);
                        await reloadTasks();
                    }}>Remove task</a>
                </div>
            </div>
            

            </div>
            
            ))}
        </div>

            <div className="see-calander-box">
            
            <Link to="/calendar" className="see-calander-button">See your calendar <FontAwesomeIcon icon={faArrowRight}/></Link>
        
            </div>
            
        </div>
                
                
    )
}