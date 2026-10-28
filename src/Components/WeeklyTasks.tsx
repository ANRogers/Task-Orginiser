import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faRepeat, } from '@fortawesome/free-solid-svg-icons';
import '../styles/Tasks.css'

import {
    setTaskCompleted,
    archiveTask,
    addRepeat,
    removeRepeat,
  type Task
} from '../services/TaskService';


export default function WeeklyTasks({    tasks,
        reloadTasks,
        onEditTask
    }: {
        tasks: Task[];
        reloadTasks: () => Promise<void>;
        onEditTask: (task: Task) => void;
    }) {

    return(
    <div className="daily-tasks-slot">
            {tasks.map((task) => (
                
                    <div className="daily-task-box" key={task.occurrence_id}>
                      <div className="daily-task-box-left">
                        <input className="daily-task-checkbox" type="checkbox" checked={task.status === 'completed'}
                        onChange={async () => {
                          await setTaskCompleted(
                              task.occurrence_id,
                              task.status !== 'completed'
                          );

                          await reloadTasks();
                        }}>
                        </input>
                        <div className={task.status === 'completed' ? "task-text-slot task-text-compleated": "task-text-slot "}>
                          <a className='discription-collapse' data-bs-toggle="collapse" href={`#collapsediscription-${task.id}`} role="button" aria-expanded="false" aria-controls="collapseExample">
                            <h1>{task.title}</h1> 
                            <div className="side-bar-task-info">
                            <p className="collections-text" style={{color: task.workspace_colour}}>{task.workspace_name}</p>
                            <p className="collections-text"> · </p>
                            <p className="collections-text">Due {new Date(task.due_date).toLocaleDateString("en-GB", {month: "short", day: "numeric",})}</p>
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
                        {["daily", "weekly", "monthly"].includes(task.task_type) && (
                        task.recurrence_id == null ? (
                            <button
                            className="repeat-daily-btn"
                            type="button"
                            onClick={async () => {
                                await addRepeat(
                                    task.id,
                                    task.task_type,
                                    1,
                                    task.due_date
                                );
    
                                await reloadTasks();
                            }}
                            >
                            <FontAwesomeIcon icon={faRepeat} />
                            Weekly
                            </button>
                        ) : (
                            <button
                            className="repeat-daily-btn repeat-btn-active"
                            type="button"
                            onClick={async () => {
                                await removeRepeat(
                                    task.id,
                                );
    
                                await reloadTasks();
                            }}
                            >
                            <FontAwesomeIcon icon={faRepeat} />
                            Weekly
                            </button>
                        )
                        )}

                          <button className="task-options-btn" type="button" aria-label="Task options" data-bs-toggle="menu" aria-expanded="false">
                              <FontAwesomeIcon icon={faEllipsisVertical} />
                          </button>
                          <div className="menu">
                            <a className="menu-item" onClick={async () => {
                                await archiveTask(task.id);
                                await reloadTasks();
                            }}>Archive task</a>
                            <a className="menu-item" onClick={async () => {
                                await onEditTask(task);
                            }}>Modify task</a>
                          </div>
                      </div>
                    </div>
                
            ))}
        </div>
    )
}