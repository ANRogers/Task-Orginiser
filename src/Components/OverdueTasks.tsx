
import {useState} from 'react';
import {
    setTaskCompleted,
    type Task
} from '../services/TaskService';
import '../styles/Tasks.css'

export default function OverdueTasks({ tasks }: { tasks: Task[] }) {
    
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    
    
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

            {tasks.map((task) => {
                const daysOverDue = Math.round(
                            (new Date(new Date().toDateString()).getTime() -
                            new Date(task.due_date).getTime()) /
                            (1000 * 60 * 60 * 24));
                return(
            <div className="side-bar-task-box" key={task.occurrence_id}>
                <input className="overdue-task-checkbox" type="checkbox"checked={task.status === 'completed'}
                onChange={() => setSelectedTask(task)}></input>
                <div className="task-text-slot ">
                    <h1>{task.title}</h1>
                    <div className="side-bar-task-info">
                    <p className="collections-text">{task.workspace_name}</p>
                    <p className="collections-text"> · </p>
                    <p className="collections-text">Due {new Date(task.due_date).toLocaleDateString("en-GB", {month: "short", day: "numeric",})}</p>
                    <p className="collections-text"> · </p>
                    <p className="collections-text">
                        { daysOverDue } { daysOverDue == 1 ? ("day"): ("days")} overdue
                    </p>
                    </div>
                </div>


            </div>
            
            )})}
                
            </div>
            {selectedTask && (
            <dialog className="dialog overdue-confirmation" open>
            <div className="dialog-header">
                <h1 className="dialog-title">Mark as compleated?</h1>
                <button type="button" className="btn-close" data-bs-dismiss="dialog" aria-label="Close" onClick={() => setSelectedTask(null)}></button>
            </div>
            <div className="dialog-body">
                <p>Are you sure you want to mark this overdue task as compleated? It will disapear from the overdue tasks after.</p>
            </div>
            <div className="dialog-footer">
                <button type="button" className="btn-solid theme-secondary" data-bs-dismiss="dialog" onClick={() => setSelectedTask(null)}>Close</button>
                <button type="button" className="btn-solid theme-primary overdue-confirmation-btn" data-bs-dismiss="dialog" 
                onClick={async () => {
                await setTaskCompleted(selectedTask.occurrence_id, (selectedTask.status != 'completed'));
                setSelectedTask(null);
                }}>Mark As Compleated</button>
            </div>
            </dialog>
            )}

        </div>
                


                
                
    )
}