import { useState, useEffect } from "react";
import * as SunCalc from "suncalc";

import SideNavBar from "../Components/SideNav"
import "../styles/HomePage.css"
import "../styles/WorkSpaceBar.css"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faCircleExclamation, faArrowRight, 
  faSquareArrowUpRight, faTableList, faSun, faMoon,
  faCalendarWeek, faList, faCircleCheck, faClock
 } from '@fortawesome/free-solid-svg-icons';

import {
  getDailyTasks,
  getWeeklyTasks,
  getOverdueTasks,
  getUpcommingTasks,
  getMonthlyTask,
  addTask,

  type Task
} from '../services/TaskService';

import {
  getWorkspaces,

  type Workspace
} from '../services/WorkspaceService'

import DailyTasks from "../Components/DailyTasks";
import WeeklyTasks from "../Components/WeeklyTasks";
import OverdueTasks from "../Components/OverdueTasks";
import UpcommingTasks from "../Components/UpcommingTasks";
import MonthlyTask from "../Components/MonthlyTask";

  
export default function HomePage() {

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
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<Task[]>([]);
  const [monthlyTask, setMonthlyTask] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [upcommingTasks, setUpcommingTasks] = useState<Task[]>([]);

    useEffect(() => {
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

        async function loadOverdueTasks() {
            try{
                const overdue_tasks = await getOverdueTasks();
                setOverdueTasks(overdue_tasks);
            } catch(error) {
                console.error('failed to load overdue tasks:', error);
            }
        }

        async function loadUpcommingTasks() {
            try{
                const upcomming_tasks = await getUpcommingTasks();
                setUpcommingTasks(upcomming_tasks);
            } catch(error) {
                console.error('failed to load overdue tasks:', error);
            }
        }

        loadDailyTasks();

        loadWeeklyTasks();

        loadMonthlyTask();

        loadOverdueTasks();

        loadUpcommingTasks();
    });


  //filters the tasks based on the buttons
  const [taskFilter, setTaskFilter] = useState("all");
  const filteredDailyTasks = dailyTasks.filter(task =>{
    if (taskFilter === "todo"){
      return task.status !== "completed";
    }

    if (taskFilter === "compleated"){
      return task.status === "completed";
    }

    return true;
  });

  const filteredWeeklyTasks = weeklyTasks.filter(task =>{
    if (taskFilter === "todo"){
      return task.status !== "completed";
    }

    if (taskFilter === "compleated"){
      return task.status === "completed";
    }

    return true;
  });

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

        console.log("New Task Added!");
    } catch (error) {
        console.error("Failed to add task:", error);
    }
}

  // todays tasks
  const total_daily_tasks_num = dailyTasks.length;
  const total_weekly_tasks_num = weeklyTasks.length;
  const total_monthly_tasks_num = 0;
  const total_num_tasks = total_daily_tasks_num + total_weekly_tasks_num + total_monthly_tasks_num;

  //overdue tasks
  let total_overdue_tasks_num = overdueTasks.length;

  //up next tasks
  let total_upcomeing_tasks_num = upcommingTasks.length;


  // compleated today overview
  let completedTasks = dailyTasks.filter(task => task.status == "completed").length + weeklyTasks.filter(task => task.status == "completed").length;
  const totalTasks = total_num_tasks;

  const progress = totalTasks > 0
      ? (completedTasks / totalTasks) * 100
      : 0;

  return (
    <div className="home-layout">
      <SideNavBar />

      <div className="content">
        <div className="workspace-info">
            <div className="workspace-current">
                <FontAwesomeIcon icon={faTableList} />
                <span className="workspace-separator">|</span>
                <span>Dashboard</span>
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
            
            <div className="today-overview">

              <div className="overview-slot">
                <div className="overview-title-slot">
                  <h1 className="overview-title">Today's Tasks</h1>
                  <FontAwesomeIcon icon={faList} />
                </div>
                
                <div className="overview-info">
                  <p className="today-tasks-overview-num">{total_num_tasks}</p>
                  <div className="today-tasks-overview-box">
                    <p className="today-daily-tasks-overview-num">{total_daily_tasks_num} Daily</p>
                    <p><b>.</b></p>
                    <p className="today-weekly-tasks-overview-num">{total_weekly_tasks_num} Weekly</p>
                  </div>
                </div>
              </div>

              <div className="overview-slot">
                <div className="overview-title-slot">
                  <h1 className="overview-title">Compleated Today</h1>
                  <FontAwesomeIcon icon={faCircleCheck} />
                </div>
                
                <div className="overview-info">
                    <p className="today-tasks-overview-num">
                        {completedTasks} / {totalTasks}
                    </p>

                    <p className="overdue-under-title-text">
                        A good start. Keep going.
                    </p>

                    
                </div>
                <div className="overview-progress-bar">
                    <div
                        className="overview-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
              </div>

              <div className="overview-slot">
                <div className="overview-title-slot">
                  <h1 className="overview-title">Needs Attention</h1>
                  <FontAwesomeIcon style={{color: "#FF8A7D"}} icon={faClock} />
                </div>
                
                <div className="overview-info">
                  <p className="today-tasks-overview-num">{total_overdue_tasks_num}</p>
                  <p className="overdue-under-title-text" style={{color: "#FF8A7D"}}>Tasks past their due date</p>
                </div>
              </div>
              
            </div>

            <div className="tasks-slot">
              <div className="todays-tasks-slot">
                <div className="todays-tasks">
                  <div className="todays-tasks-info">
                    <div className="todays-tasks-title">
                      
                      <h1>Todays Tasks</h1>
                      <p className="task-number" id="task-number"> {total_num_tasks}</p>
                      <a className="view-all-tasks">View All Tasks <FontAwesomeIcon icon={faSquareArrowUpRight} /></a>
                    </div>
                    <div className="todays-tasks-options">

                      <button className="tasks-option-box" onClick={() => setTaskFilter("all")}>
                        All Tasks
                      </button>

                      <button className="tasks-option-box" onClick={() => setTaskFilter("todo")}>
                        To Do
                      </button>

                      <button className="tasks-option-box" onClick={() => setTaskFilter("compleated")}>
                        Compleated
                      </button>

                    </div>
                  </div>
                  <div className="todays-tasks-scroll-box">

                  <div className="task-type-title">
                    <FontAwesomeIcon icon={faSun} />
                    <h1>Daily Tasks</h1>
                    
                    <p>Here is todays tasks!</p>
                  </div>
                  
                  <DailyTasks tasks={filteredDailyTasks} />
                  
                  <div className="task-type-title">
                    <FontAwesomeIcon icon={faCalendarWeek} />                        
                    <h1>Weekly Tasks</h1>
                    
                    <p>Here is your weekly tasks!</p>
                  </div>

                  <WeeklyTasks tasks={filteredWeeklyTasks} />
                  
                  <div className="add-task-box">
                    <button data-bs-toggle="dialog" data-bs-target="#AddTaskOverlay" data-bs-backdrop="static"><FontAwesomeIcon className="add-task-icon" icon={faPlus} /> Add a task for today</button>
                  </div>
                  </div>
                </div>

                <MonthlyTask task={monthlyTask}/>
                
              </div>
              <div className="overdue-tasks-slot">
                <div className="overdue-tasks">
                  <div className="todays-tasks-title">
                    <h1> <FontAwesomeIcon icon={faCircleExclamation} /> Overdue</h1>
                    <p className="overdue-number" id="overdue-number"> {total_overdue_tasks_num}</p>
                  </div>
                  <p className="overdue-under-title-text">A new day to get these back on track.</p>
                  <OverdueTasks tasks={overdueTasks}/>
                  
                </div>
              
                <div className="upcomeing-tasks">
                  <div className="todays-tasks-title">
                    <h1>Up Next</h1>
                    <p className="task-number" id="upcomming-number"> {total_upcomeing_tasks_num}</p>
                  </div>
                  {upcommingTasks.length > 0 ? (
                    <div>
                    <p className="overdue-under-title-text">A new day to get these back on track.</p>
                  
                    <UpcommingTasks tasks={upcommingTasks}/>
                  </div>
                ) : (
                <div>
                  <p className="overdue-under-title-text">No Upcomming tasks tomrrow!</p>
                  <div className="see-calander-box">
                
                  <button className="see-calander-button">See your calendar <FontAwesomeIcon icon={faArrowRight} /></button>
            
                  </div>
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
      </div>
    </div>
  );
}