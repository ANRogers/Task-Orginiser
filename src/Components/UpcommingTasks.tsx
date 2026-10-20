import {
    setTaskCompleted,
    type Task
} from '../services/TaskService';
import '../styles/Tasks.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, } from '@fortawesome/free-solid-svg-icons';

export default function UpcommingTasks({ tasks }: { tasks: Task[] }) {
    
    

    
    
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
                onChange={() => 
                setTaskCompleted(task.occurrence_id, (task.status != 'completed'))
                }></input>
            <div className={task.status === 'completed' ? "task-text-slot task-text-compleated": "task-text-slot "}>
                <h1>{task.title}</h1>
                <div className="side-bar-task-info">
                <p className="collections-text">{task.workspace_name}</p>
                <p className="collections-text"> · </p>
                <p className="collections-text">{task.task_type}</p>
                </div>
            </div>
            </div>
            ))}
        </div>

            <div className="see-calander-box">
            
            <button className="see-calander-button">See your calendar <FontAwesomeIcon icon={faArrowRight} /></button>
        
            </div>
            
        </div>
                
                
    )
}