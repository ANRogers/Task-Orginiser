import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faRepeat, } from '@fortawesome/free-solid-svg-icons';
import '../styles/Tasks.css'

import {
    archiveTask,
    deleteTask,
    unarchiveTask,
  type DisplayTask
} from '../services/TaskService';


export default function DisplayTasks({    tasks,
        reloadTasks,
        onEditTask
    }: {
        tasks: DisplayTask[];
        reloadTasks: () => Promise<void>;
        onEditTask: (task: DisplayTask) => void;
    }) {

    return(
    <div className="daily-tasks-slot">
            {tasks.map((task) => (
                
                    <div className="daily-task-box" key={task.id}>
                      <div className="daily-task-box-left">
                        <div>
                            <a className='discription-collapse' data-bs-toggle="collapse" href={`#collapsediscription-${task.id}`} role="button" aria-expanded="false" aria-controls="collapseExample">
                            <h1>{task.title}</h1> 
                            <div className="side-bar-task-info">
                            <p className="collections-text" style={{color: task.workspace_colour}}>{task.workspace_name}</p>
                            </div>
                            </a>
                        <div className="collapse" id={`collapsediscription-${task.id}`}>
                            <div>
                                {task.description}
                            </div>
                        </div>
                          
                        </div>
                        
                        </div>
                        
                      <div className="daily-task-box-right">
                          <button className="repeat-daily-btn">
                              <FontAwesomeIcon icon={faRepeat} />
                              Repeat
                          </button>

                          <button className="task-options-btn" type="button" aria-label="Task options" data-bs-toggle="menu" aria-expanded="false">
                              <FontAwesomeIcon icon={faEllipsisVertical} />
                          </button>
                          <div className="menu">
                            <a className="menu-item" onClick={async () => {
                                await unarchiveTask(task.id);
                                await reloadTasks();
                            }}>Unarchive Task</a>
                            <a className="menu-item" onClick={async () => {
                                await onEditTask(task);
                            }}>Modify Task</a>
                            <a className="menu-item" onClick={async () => {
                                await deleteTask(task.id);
                                await reloadTasks();
                            }}>Delete Task</a>
                          </div>
                      </div>

                      
                    </div>
                    
                
            ))}
        </div>
    )
}