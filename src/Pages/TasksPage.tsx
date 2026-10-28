import { useState, useEffect } from "react";
import * as SunCalc from "suncalc";

import SideNavBar from "../Components/SideNav"
import "../styles/HomePage.css"
import "../styles/WorkSpaceBar.css"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faCalendarDays, faBoxArchive, 
  faSquareArrowUpRight, faTableList, faSun, faMoon,
  faCalendarWeek, faList, faCircleCheck, faClock
 } from '@fortawesome/free-solid-svg-icons';

import {
  getDailyTasks,
  getWeeklyTasks,
  getMonthlyTask,
  getArchivedTasks,
  addTask,
  editDisplayTask,

  type DisplayTask
} from '../services/TaskService';

import {
  getWorkspaces,

  type Workspace
} from '../services/WorkspaceService'


import DisplayTasks from "../Components/DisplayTasks";
import ArchivedTasks from "../Components/ArchivedTasks";

  
export default function TaskPage() {

  //date and time
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const today = currentTime.getFullYear() + "-" +
    String(currentTime.getMonth() + 1).padStart(2, "0") + "-" +
    String(currentTime.getDate()).padStart(2, "0");

  // Bristol coordinates
  const latitude = 51.4545;
  const longitude = -2.5879;

  const sun_times = SunCalc.getTimes(currentTime,latitude,longitude);

  const is_sun_up = currentTime >= sun_times.sunrise && currentTime < sun_times.sunset;

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    async function loadWorkspaces() {
      try{
        const collections = await getWorkspaces();
        setWorkspaces(collections);
      } catch(error){
        console.error('failed to load workspaces:', error);
      }
    }

    loadWorkspaces();
  }, []);

  //loads daily and weekly tasks;
  const [dailyTasks, setDailyTasks] = useState<DisplayTask[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<DisplayTask[]>([]);
  const [monthlyTask, setMonthlyTask] = useState<DisplayTask[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<DisplayTask[]>([]);


    async function loadDailyTasks() {
        try{
            const daily_tasks = await getDailyTasks();
            setDailyTasks(daily_tasks);
        } catch(error) {
            console.error('failed to load daily tasks:', error);
        }
    }

    async function loadWeeklyTasks() {
        try{
            const weekly_tasks = await getWeeklyTasks();
            setWeeklyTasks(weekly_tasks);
        } catch(error) {
            console.error('failed to load weekly tasks:', error);
        }
    }

    async function loadMonthlyTask() {
        try{
            const monthly_task = await getMonthlyTask();
            setMonthlyTask(monthly_task);
        } catch(error) {
            console.error('failed to load weekly tasks:', error);
        }
    }

    async function loadArchiveTasks() {
        try{
            const archived_tasks = await getArchivedTasks();
            setArchivedTasks(archived_tasks);
        } catch(error) {
            console.error('failed to load archived tasks:', error);
        }
    }

    //for editing tasks
    const [editingTask, setEditingTask] = useState<DisplayTask | null>(null);

    useEffect(() => {
      loadDailyTasks();

      loadWeeklyTasks();

      loadMonthlyTask();

      loadArchiveTasks();

    }, []);

  async function reloadTasks() {
    loadDailyTasks();

    loadWeeklyTasks();

    loadMonthlyTask();

    setEditingTask(dailyTasks[0]);

    loadArchiveTasks();
  }


  //filters the tasks based on the buttons
  const [taskFilter, setTaskFilter] = useState("all");

    // Filters tasks based on the selected button
    function assignFilteredTasks() {
        switch (taskFilter) {
            case "all":
                return [...dailyTasks, ...weeklyTasks, ...monthlyTask];

            case "daily":
                return dailyTasks;

            case "weekly":
                return weeklyTasks;

            case "monthly":
                return monthlyTask;


            case "archived":
                return archivedTasks;

            default:
                return [...dailyTasks, ...weeklyTasks, ...monthlyTask];
        }
    }

const filteredTasks = assignFilteredTasks();
  

  //tasks
  const [title, setTitle] = useState("");
  const [discription, setDiscription] = useState("");
  const [taskType, setTaskType] = useState("daily");
  const [dueDate, setDueDate] = useState(today);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);

  useEffect(() => {
      if (workspaces.length > 0 && workspaceId === null) {
          setWorkspaceId(workspaces[0].id);
      }
  }, [workspaces, workspaceId]);

  async function AddTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (workspaceId === null) {
        console.error("Please select a workspace.");
        return;
    }

    try {
        await addTask(title, discription, workspaceId, taskType, dueDate);

        // Reset form fields
        setTitle("");
        setDiscription("");
        setTaskType("daily");
        setDueDate(today);

    } catch (error) {
        console.error("Failed to add task:", error);
    }

    reloadTasks()
  }

  const [titleEdit, setTitleEdit] = useState("");
  const [discriptionEdit, setDiscriptionEdit] = useState("");
  const [taskTypeEdit, setTaskTypeEdit] = useState("daily");
  const [workspaceIdEdit, setWorkspaceIdEdit] = useState<number | null>(null);

  function openEditTask(task: DisplayTask) {
      setEditingTask(task);

      setTitleEdit(task.title);
      setDiscriptionEdit(task.description ?? "");
      setTaskTypeEdit(task.task_type);
      setWorkspaceIdEdit(task.workspace_id);

      const dialog = document.getElementById("EditTaskOverlay");

      if (dialog instanceof HTMLDialogElement) {
          dialog.showModal();
      }
  }

  async function EditTask(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      if (editingTask === null) {
          console.error("Please select a task before trying to edit.");
          return;
      }

      if (workspaceIdEdit === null) {
          console.error("Please select a workspace.");
          return;
      }

      try {
          await editDisplayTask(
              editingTask.id,
              titleEdit,
              discriptionEdit,
              workspaceIdEdit,
              taskTypeEdit,

          );

          await reloadTasks();

          const dialog = document.getElementById("EditTaskOverlay");

          if (dialog instanceof HTMLDialogElement) {
              dialog.close();
          }
          setEditingTask(null);

          console.log("Task edited!");
      } catch (error) {
          console.error("Failed to edit task:", error);
      }
  }

  
   








 

  return (
    <div className="home-layout">
      <SideNavBar />

      <div className="content">
        <div className="workspace-info">
            <div className="workspace-current">
                <FontAwesomeIcon icon={faTableList} />
                <span className="workspace-separator">|</span>
                <span>Tasks</span>
            </div>
            <div className="workspace-actions">
              <button data-bs-toggle="dialog" data-bs-target="#AddTaskOverlay" data-bs-backdrop="static" className="topbar-newtask">
                <FontAwesomeIcon icon={faPlus} /> New Task
              </button>
            </div>
            
        </div>
        <div className="dashboard">
          <div className="dash-title">
            <div className="dash-title-left">
              <h2>A little focus goes a long way.</h2>
              <p>Good morning, Alex. Here’s what’s on your plate today.</p>
            </div>
            <div className="dash-title-right">
              <div className="dash-date-box">
                <FontAwesomeIcon icon={is_sun_up ? faSun : faMoon} />
                {currentTime.toLocaleDateString("en-GB", {
                  weekday: "long",
                  month: "long",
                  day: "numeric"
                })}
              </div>
            </div>
          </div>
            
            
            <div className="tasks-slot">
              <div className="todays-tasks-slot">
                <div className="todays-tasks">
                  <div className="todays-tasks-info">
                    
                    <div className="todays-tasks-options">

                      <button className="tasks-option-box" onClick={() => setTaskFilter("all")}>
                        All Tasks
                      </button>

                      <button className="tasks-option-box" onClick={() => setTaskFilter("daily")}>
                        Daily
                      </button>

                      <button className="tasks-option-box" onClick={() => setTaskFilter("weekly")}>
                        Weekly
                      </button>

                      <button className="tasks-option-box" onClick={() => setTaskFilter("monthly")}>
                        Monthly
                      </button>


                      <button className="tasks-option-box" onClick={() => setTaskFilter("archived")}>
                        Archived
                      </button>
                    </div>
                  </div>
                  
                {taskFilter == "all"? (
                    <div className="todays-tasks-scroll-box">
                  <div className="task-type-title">
                    <FontAwesomeIcon icon={faSun} />
                    <h1>Daily Tasks</h1>
                    
                    <p>Here is todays tasks!</p>
                  </div>
                  
                  {dailyTasks.length != 0 ? (
                    <DisplayTasks tasks={dailyTasks} reloadTasks={reloadTasks} onEditTask={openEditTask} />
                  ): (
                    
                    <p className="no-tasks-text">No tasks found here. Try adding a new task or selecting a different filter.</p>
                    
                  )}
                  
                  
                  <div className="task-type-title">
                    <FontAwesomeIcon icon={faCalendarWeek} />                        
                    <h1>Weekly Tasks</h1>
                    
                    <p>Here is your weekly tasks!</p>
                  </div>

                  {weeklyTasks.length != 0 ? (
                    <DisplayTasks tasks={weeklyTasks} reloadTasks={reloadTasks} onEditTask={openEditTask}/>
                  ): (
                    
                    <p className="no-tasks-text">No tasks found here. Try adding a new task or selecting a different filter.</p>
                    
                  )}

                  <div className="task-type-title">
                    <FontAwesomeIcon icon={faCalendarDays} />                        
                    <h1>Monthly Tasks</h1>
                    
                    <p>Here is your monthly tasks!</p>
                  </div>

                  {monthlyTask.length != 0 ? (
                    <DisplayTasks tasks={monthlyTask} reloadTasks={reloadTasks} onEditTask={openEditTask}/>
                  ): (
                    
                    <p className="no-tasks-text">No tasks found here. Try adding a new task or selecting a different filter.</p>
                    
                  )}
                  
                  
                  
                </div>
                ) : (
                  
                  
                    
                  
                  
                    <div className="todays-tasks-scroll-box">
                      {taskFilter === "daily" && (
                        <div className="task-type-title">
                          <FontAwesomeIcon icon={faSun} />
                          <h1>Daily Tasks</h1>
                          <p>Here are today's tasks!</p>
                        </div>
                      )}

                      {taskFilter === "weekly" && (
                        <div className="task-type-title">
                          <FontAwesomeIcon icon={faCalendarWeek} />
                          <h1>Weekly Tasks</h1>
                          <p>Here are your weekly tasks!</p>
                        </div>
                      )}

                      {taskFilter === "monthly" && (
                        <div className="task-type-title">
                          <FontAwesomeIcon icon={faCalendarDays} />
                          <h1>Monthly Tasks</h1>
                          <p>Here are your monthly tasks!</p>
                        </div>
                      )}

                      {taskFilter === "archived" && (
                        <div className="task-type-title">
                          <FontAwesomeIcon icon={faBoxArchive} />
                          <h1>Archived Tasks</h1>
                          <p>Here are your archived tasks!</p>
                        </div>
                      )}
                     {filteredTasks.length != 0 ? (
                      taskFilter === "archived" ? (
                        <ArchivedTasks tasks={filteredTasks} reloadTasks={reloadTasks} onEditTask={openEditTask} />
                      ) : (
                        <DisplayTasks tasks={filteredTasks} reloadTasks={reloadTasks} onEditTask={openEditTask} />
                      )
                    
                    
                    ): (
                    
                    <p className="no-tasks-text">No tasks found here. Try adding a new task or selecting a different filter.</p>
                    
                  )}
                  </div>
                )}
                
                </div>

                
                
              </div>
              
            </div>

        </div>

        {/* add task overlay */}
        <dialog className="dialog add-task-dialog" id="AddTaskOverlay">
          <div className="dialog-header">
            <h1 className="dialog-title">Create a task</h1>
            
          </div>
          <form onSubmit={AddTask}>
          <div className="dialog-body">
            
            <div className="add-task-input-box">
              <h5>Task Name</h5>
              <input className="add-task-text-input" type="text" id="taskName" value={title} placeholder="Enter Task Name" required onChange={e => setTitle(e.target.value)}></input>
            </div>

            <div className="add-task-input-box">
              <h5>Notes</h5>
              <input type="text" className="add-task-text-input" id="taskNote" placeholder="Enter Notes" value={discription} onChange={e => setDiscription(e.target.value)}></input>
            </div>

            <div className="add-task-input-box">
              <h5>Task Type</h5>
              <div className="add-task-type-radio-slot">

                <label className="add-task-type-radio-box">
                    <div className="add-task-radio-top">
                        <h5>Daily</h5>
                        <input type="radio" checked={taskType === "daily"} name="taskType" value="daily" onChange={e => setTaskType(e.target.value)} />
                    </div>

                    <p>An everyday task</p>
                </label>

                <label className="add-task-type-radio-box">
                    <div className="add-task-radio-top">
                        <h5>Weekly</h5>
                        <input type="radio" checked={taskType === "weekly"} name="taskType" value="weekly" onChange={e => setTaskType(e.target.value)}/>
                    </div>

                    <p>For the same day each week</p>
                </label>

                <label className="add-task-type-radio-box">
                    <div className="add-task-radio-top">
                        <h5>Monthly</h5>
                        <input type="radio" checked={taskType === "monthly"} name="taskType" value="monthly" onChange={e => setTaskType(e.target.value)}/>
                    </div>

                    <p>For the same day each month</p>
                </label>

              </div>

              <div className="add-task-date-collection-slot">
                <div className="add-task-input-box">
                  <h5>Squedualed Date</h5>
                  <input className="add-task-text-input" required id="taskDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}></input>
                </div>
              

                <div className="add-task-input-box">
                    <h5>Workspace</h5>

                    <select
                        className="add-task-collection"
                        id="Workspace"
                        value={workspaceId ?? ""}
                        onChange={e => setWorkspaceId(Number(e.target.value))}
                        required
                    >
                        {workspaces.map(workspace => (
                            <option key={workspace.id} value={workspace.id}>
                                {workspace.name}
                            </option>
                        ))}
                    </select>
                </div>
              </div>
            </div>
            
            
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn-solid theme-secondary add-task-cancel-btn" data-bs-dismiss="dialog">Cancel</button>
            <button type="submit" className="btn-solid theme-secondary add-task-submit-btn" data-bs-dismiss="dialog"><FontAwesomeIcon icon={faPlus} />Create Task</button>
          </div>
          </form>
        </dialog>


         {/* edit task overlay */}
        <dialog className="dialog add-task-dialog" id="EditTaskOverlay">
          <div className="dialog-header">
            <h1 className="dialog-title">Edit task</h1>
            
          </div>
          <form onSubmit={EditTask}>
          <div className="dialog-body">
            
            <div className="add-task-input-box">
              <h5>Task Name</h5>
              <input className="add-task-text-input" type="text" id="taskName" value={titleEdit} placeholder="Enter Task Name" required onChange={e => setTitleEdit(e.target.value)}></input>
            </div>

            <div className="add-task-input-box">
              <h5>Notes</h5>
              <input type="text" className="add-task-text-input" id="taskNote" placeholder="Enter Notes" value={discriptionEdit} onChange={e => setDiscriptionEdit(e.target.value)}></input>
            </div>

            <div className="add-task-input-box">
              <h5>Task Type</h5>
              <div className="add-task-type-radio-slot">

                <label className="add-task-type-radio-box">
                    <div className="add-task-radio-top">
                        <h5>Daily</h5>
                        <input type="radio" checked={taskTypeEdit === "daily"} name="taskType" value="daily" onChange={e => setTaskTypeEdit(e.target.value)} />
                    </div>

                    <p>An everyday task</p>
                </label>

                <label className="add-task-type-radio-box">
                    <div className="add-task-radio-top">
                        <h5>Weekly</h5>
                        <input type="radio" checked={taskTypeEdit === "weekly"} name="taskType" value="weekly" onChange={e => setTaskTypeEdit(e.target.value)}/>
                    </div>

                    <p>For the same day each week</p>
                </label>

                <label className="add-task-type-radio-box">
                    <div className="add-task-radio-top">
                        <h5>Monthly</h5>
                        <input type="radio" checked={taskTypeEdit === "monthly"} name="taskType" value="monthly" onChange={e => setTaskTypeEdit(e.target.value)}/>
                    </div>

                    <p>For the same day each month</p>
                </label>

              </div>

              <div className="add-task-date-collection-slot">
                
              

                <div className="add-task-input-box">
                    <h5>Workspace</h5>

                    <select
                        className="add-task-collection"
                        id="Workspace"
                        value={workspaceIdEdit ?? ""}
                        onChange={e => setWorkspaceIdEdit(Number(e.target.value))}
                        required
                    >
                        {workspaces.map(workspace => (
                            <option key={workspace.id} value={workspace.id}>
                                {workspace.name}
                            </option>
                        ))}
                    </select>
                </div>
              </div>
            </div>
            
            
          </div>
          <div className="dialog-footer">
            <button
              type="button"
              className="btn-solid theme-secondary add-task-cancel-btn"
              onClick={() => {
                  const dialog = document.getElementById("EditTaskOverlay");

                  if (dialog instanceof HTMLDialogElement) {
                      dialog.close();
                  }
                  setEditingTask(null);
              }}
          >
              Cancel
          </button>

          <button
              type="submit"
              className="btn-solid theme-secondary add-task-submit-btn"
          >
              Save Changes
          </button>
          </div>
          </form>
        </dialog>
      </div>
    </div>
  );
}