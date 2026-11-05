//page for createing new pages

import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import * as SunCalc from "suncalc";

import SideNavBar from "../Components/SideNav"
import "../styles/HomePage.css"
import "../styles/WorkSpaceBar.css"
import "../styles/Statistic.css"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faCircleExclamation, faArrowRight, 
  faSquareArrowUpRight, faTableList, faSun, faMoon,
  faCalendarWeek, faList, faCircleCheck, faClock, faCalendarDays
 } from '@fortawesome/free-solid-svg-icons';

import {
  getTodaysDailyTasks,
  getTodaysWeeklyTasks,
  getOverdueTasks,
  getUpcommingTasks,
  getTodaysMonthlyTasks,
  addTask,

  type Task
} from '../services/TaskService';

import {
  getWorkspaces,

  type Workspace
} from '../services/WorkspaceService'

import StatsPieChart from "../Components/PieChartDisplay";
import StatsBarChart from '../Components/BarChartDisplay';




  
export default function StatisticPage() {

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

//   //loads daily and weekly tasks;
//   const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
//   const [weeklyTasks, setWeeklyTasks] = useState<Task[]>([]);
//   const [monthlyTasks, setMonthlyTasks] = useState<Task[]>([]);
//   const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
//   const [upcommingTasks, setUpcommingTasks] = useState<Task[]>([]);



//     async function loadDailyTasks() {
//         try{
//             const daily_tasks = await getTodaysDailyTasks();
//             setDailyTasks(daily_tasks);
//         } catch(error) {
//             console.error('failed to load daily tasks:', error);
//         }
//     }

//     async function loadWeeklyTasks() {
//         try{
//             const weekly_tasks = await getTodaysWeeklyTasks();
//             setWeeklyTasks(weekly_tasks);
//         } catch(error) {
//             console.error('failed to load weekly tasks:', error);
//         }
//     }

//     async function loadMonthlyTask() {
//         try{
//             const monthly_tasks = await getTodaysMonthlyTasks();
//             setMonthlyTasks(monthly_tasks);
//         } catch(error) {
//             console.error('failed to load weekly tasks:', error);
//         }
//     }

//     async function loadOverdueTasks() {
//         try{
//             const overdue_tasks = await getOverdueTasks();
//             setOverdueTasks(overdue_tasks);
//         } catch(error) {
//             console.error('failed to load overdue tasks:', error);
//         }
//     }

//     async function loadUpcommingTasks() {
//         try{
//             const upcomming_tasks = await getUpcommingTasks();
//             setUpcommingTasks(upcomming_tasks);
//         } catch(error) {
//             console.error('failed to load overdue tasks:', error);
//         }
//     }

//     //for editing tasks
//     const [editingTask, setEditingTask] = useState<Task | null>(null);

//     useEffect(() => {
//       loadDailyTasks();

//       loadWeeklyTasks();

//       loadMonthlyTask();

//       loadOverdueTasks();

//       loadUpcommingTasks();

//     }, []);

//   async function reloadTasks() {
//     loadDailyTasks();

//     loadWeeklyTasks();

//     loadMonthlyTask();

//     loadOverdueTasks();

//     loadUpcommingTasks();

//     setEditingTask(dailyTasks[0]);
//   }


    const completedTasks = 10;
    const completedLate = 4;
    const todoTasks = 5;
    const overdueTasks = 2;

    const dailyStats = [
    { day: 'Mon', completed: 5, late: 1 },
    { day: 'Tue', completed: 3, late: 2 },
    { day: 'Wed', completed: 7, late: 0 },
    { day: 'Thu', completed: 4, late: 1 },
    { day: 'Fri', completed: 6, late: 2 },
    { day: 'Sat', completed: 2, late: 0 },
    { day: 'Sun', completed: 4, late: 1 }
];

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

    //reloadTasks()
  }



  

  return (
    <div className="home-layout">
        <SideNavBar />

        <div className="content">
        <div className="workspace-info">
            <div className="workspace-current">
            <FontAwesomeIcon icon={faTableList} />
            <span className="workspace-separator">|</span>
            <span>Template</span>
            </div>

            <div className="workspace-actions">
            <button
                data-bs-toggle="dialog"
                data-bs-target="#AddTaskOverlay"
                data-bs-backdrop="static"
                className="topbar-newtask"
            >
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
                {currentTime.toLocaleDateString("en-US", {
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
                  <h1 className="overview-title">Completion progress</h1>
                  <FontAwesomeIcon style={{color: "#8B91FF"}} icon={faCircleCheck} />
                </div>
                
                <div className="overview-info">
                    <p className="today-tasks-overview-num" style={{margin: "0"}}>
                        <div className="tasks-compleation-progress-overview">
                            <p>50%</p>
                        <p className="tasks-compleation-progress-overview-text">
                            {2} of {4} tasks
                        </p>
                        </div>
                    </p>                    
                </div>
                <div className="overview-progress-bar">
                    <div
                        className="overview-progress-fill"
                        style={{ width: `${50}%` }}
                    />
                </div>
              </div>

              <div className="overview-slot">
                <div className="overview-title-slot">
                  <h1 className="overview-title">Completed on time</h1>
                  <FontAwesomeIcon style={{color: "#6BCF97"}} icon={faCircleCheck} />
                </div>
                
                <div className="overview-info">
                     <p className="today-tasks-overview-num" style={{margin: "0"}}>
                        <div className="tasks-compleation-progress-overview">
                            <p>20</p>
                        <p className="tasks-compleation-time-overview-text">
                            {83}% of compleated
                        </p>
                        </div>
                    </p>
                </div>
                
              </div>

              <div className="overview-slot">
                <div className="overview-title-slot">
                  <h1 className="overview-title">Completed late</h1>
                  <FontAwesomeIcon style={{color: "#F2B86A"}} icon={faCircleCheck} />
                </div>
                
                <div className="overview-info">
                    <p className="today-tasks-overview-num" style={{margin: "0"}}>
                        <div className="tasks-compleation-progress-overview">
                            <p>4</p>
                        <p className="tasks-compleation-late-overview-text">
                            {17}% of compleated
                        </p>
                        </div>
                    </p>
                </div>
                
              </div>
              
            </div>

            
            {/* box for holding the displays of data */}
            <div className="stats-data-display-slot">

                {/* slot for displaying the graph data */}
                <div className="stats-graph-display-slot">

                    <div className="bar-graph-legend-key-slot">

                    <div className="stats-data-display-title">
                        <h2>Task Compleation History</h2>
                        <p>Here is your task history</p>
                    </div>

                    <div className="bar-graph-legend-key">
                        <div className="bar-graph-legend-key-box" style={{ "--legend-color": "#8B91FF" } as React.CSSProperties}>
                            On Time
                        </div>

                        <div className="bar-graph-legend-key-box" style={{ "--legend-color": "#F2B86A" } as React.CSSProperties}>
                            Late
                        </div>

                    </div>

                    </div>

                    <div className="stats-graph-display-box">
                        <StatsBarChart data={dailyStats} />
                    </div>
                </div>

                {/* Slot for displaying pie chart */}
                <div className="stats-pie-chart-slot">
                    <div className="stats-data-display-title">
                        <h2>Task Compleation History</h2>
                        <p>Here is your task history</p>
                    </div>
                    <div className="stats-pie-chart-box">
                        <StatsPieChart
                            completed={completedTasks}
                            late={completedLate}
                            todo={todoTasks}
                            overdue={overdueTasks}
                        />
                        <div className="pie-chart-legend-slot">

                            <div className="pie-chart-legend-box">
                                <div className="pie-chart-legend-text" style={{ "--legend-color": "#8B91FF" } as React.CSSProperties}>
                                    <p>Completed on Time</p>
                                </div>
                                <div className="pie-chart-legend-number">
                                    <p>{completedTasks}</p>
                                </div>
                            </div>

                            <div className="pie-chart-legend-box">
                                <div className="pie-chart-legend-text" style={{ "--legend-color": "#F2B86A" } as React.CSSProperties}>
                                    <p>Completed Late</p>
                                </div>
                                <div className="pie-chart-legend-number">
                                    <p>{completedLate}</p>
                                </div>
                            </div>

                            <div className="pie-chart-legend-box">
                                <div className="pie-chart-legend-text" style={{ "--legend-color": "#FF8A7D" } as React.CSSProperties}>
                                    <p>Overdue</p>
                                </div>
                                <div className="pie-chart-legend-number">
                                    <p>{overdueTasks}</p>
                                </div>
                            </div>

                            <div className="pie-chart-legend-box">
                                <div className="pie-chart-legend-text" style={{ "--legend-color": "#2A313B" } as React.CSSProperties}>
                                    <p>To Do</p>
                                </div>
                                <div className="pie-chart-legend-number">
                                    <p>{todoTasks}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>

            </div>

            {/* boxes for displaying progress by type */}
            <div className="progress-tasks-type-display-slot">

                <div className="progress-task-type-box">
                    <div className="task-type-progress-title-slot">
                        <h2><FontAwesomeIcon style={{color: "#8B91FF"}} icon={faCircleCheck} /> Daily</h2>
                        <div className="task-type-progress-title-percentage">
                            <p>{18}/{21}</p>
                            <h2>86%</h2>
                        </div>
                    </div>
                    
                    <div className="overview-progress-bar">
                        <div
                            className="overview-progress-fill"
                            style={{ width: `${50}%` }}
                        />
                    </div>
                </div>

                <div className="progress-task-type-box">
                    <div className="task-type-progress-title-slot">
                        <h2><FontAwesomeIcon style={{color: "#8B91FF"}} icon={faCircleCheck} /> Weekly</h2>
                        <div className="task-type-progress-title-percentage">
                            <p>{18}/{21}</p>
                            <h2>86%</h2>
                        </div>
                    </div>
                    
                    <div className="overview-progress-bar">
                        <div
                            className="overview-progress-fill"
                            style={{ width: `${50}%` }}
                        />
                    </div>
                </div>

                <div className="progress-task-type-box">
                    <div className="task-type-progress-title-slot">
                        <h2><FontAwesomeIcon style={{color: "#8B91FF"}} icon={faCircleCheck} /> Monthly</h2>
                        <div className="task-type-progress-title-percentage">
                            <p>{18}/{21}</p>
                            <h2>86%</h2>
                        </div>
                    </div>
                    
                    <div className="overview-progress-bar">
                        <div
                            className="overview-progress-fill"
                            style={{ width: `${50}%` }}
                        />
                    </div>
                </div>

            </div>

            {/* display for tasks complated ordered by due date first */}
            <div className="task-compleation-history-slot">
                <div className="task-compleation-title">
                    <h2>Task Compleation History</h2>
                    <p>Here is your task history</p>
                </div>

                <div className="task-compleation-table-top">
                    <p>Task</p>
                    <p>Type</p>
                    <p>Due Date</p>
                    <p>Completion Date</p>
                    <p>Timing Status</p>
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
                <input
                    className="add-task-text-input"
                    type="text"
                    id="taskName"
                    value={title}
                    placeholder="Enter Task Name"
                    required
                    onChange={e => setTitle(e.target.value)}
                />
                </div>

                <div className="add-task-input-box">
                <h5>Notes</h5>
                <input
                    type="text"
                    className="add-task-text-input"
                    id="taskNote"
                    placeholder="Enter Notes"
                    value={discription}
                    onChange={e => setDiscription(e.target.value)}
                />
                </div>

                <div className="add-task-input-box">
                <h5>Task Type</h5>

                <div className="add-task-type-radio-slot">

                    <label className="add-task-type-radio-box">
                    <div className="add-task-radio-top">
                        <h5>Daily</h5>
                        <input
                        type="radio"
                        checked={taskType === "daily"}
                        name="taskType"
                        value="daily"
                        onChange={e => setTaskType(e.target.value)}
                        />
                    </div>
                    <p>An everyday task</p>
                    </label>

                    <label className="add-task-type-radio-box">
                    <div className="add-task-radio-top">
                        <h5>Weekly</h5>
                        <input
                        type="radio"
                        checked={taskType === "weekly"}
                        name="taskType"
                        value="weekly"
                        onChange={e => setTaskType(e.target.value)}
                        />
                    </div>
                    <p>For the same day each week</p>
                    </label>

                    <label className="add-task-type-radio-box">
                    <div className="add-task-radio-top">
                        <h5>Monthly</h5>
                        <input
                        type="radio"
                        checked={taskType === "monthly"}
                        name="taskType"
                        value="monthly"
                        onChange={e => setTaskType(e.target.value)}
                        />
                    </div>
                    <p>For the same day each month</p>
                    </label>

                </div>

                <div className="add-task-date-collection-slot">
                    <div className="add-task-input-box">
                    <h5>Squedualed Date</h5>
                    <input
                        className="add-task-text-input"
                        required
                        id="taskDate"
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                    />
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
                <button
                type="button"
                className="btn-solid theme-secondary add-task-cancel-btn"
                data-bs-dismiss="dialog"
                >
                Cancel
                </button>

                <button
                type="submit"
                className="btn-solid theme-secondary add-task-submit-btn"
                data-bs-dismiss="dialog"
                >
                <FontAwesomeIcon icon={faPlus} /> Create Task
                </button>
            </div>
            </form>
        </dialog>

        </div>
    </div>
    );
}