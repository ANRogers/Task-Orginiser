//page for createing new pages

import { useState, useEffect, useMemo } from "react";
import * as SunCalc from "suncalc";

import SideNavBar from "../Components/SideNav"
import "../styles/HomePage.css"
import "../styles/WorkSpaceBar.css"
import "../styles/Statistic.css"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faTableList, faSun, faMoon, faCircleCheck, faAngleLeft, faAngleRight
 } from '@fortawesome/free-solid-svg-icons';

import {
  getAllTasksStats,
  addTask,

  type Task
} from '../services/TaskService';

import {
  getWorkspaces,

  type Workspace
} from '../services/WorkspaceService'

import StatsPieChart from "../Components/PieChartDisplay";
import StatsBarChart from '../Components/BarChartDisplay';
import TaskHistory from "../Components/TaskHistory";


//used to get a default date when loading the page
const getLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return getLocalDate(date);
};

//returns a persentage of the two numbers

const getProgress = (completed: number, uncompleted: number) => {
    const total = completed + uncompleted;

    return total > 0
        ? Math.round((completed / total) * 100)
        : 0;
};
  
export default function StatisticPage() {

    // Date and time
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const today = getLocalDate(currentTime);

    // Sun information
    const latitude = 51.4545;
    const longitude = -2.5879;

    const sun_times = SunCalc.getTimes(currentTime, latitude, longitude);
    const is_sun_up =
    sun_times.sunrise != null &&
    sun_times.sunset != null &&
    currentTime >= sun_times.sunrise &&
    currentTime < sun_times.sunset;

    // Database data
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState("all");
    const [allTasks, setAllTasks] = useState<Task[]>([]);

    
    

    async function LoadAllTasks() {
        try {
            const all_tasks = await getAllTasksStats(selectedWorkspace);
            await setAllTasks(all_tasks);
        } catch (error) {
            console.error("Failed to load tasks:", error);
        }
    }

    //filter all tasks baised on current page
    //creat a page number count and page number total
    const [pageNumCurrent, setPageNumCurrent] = useState(1);
    const pageNumTotal = useMemo(() => {
        const newpagenum = Math.ceil(allTasks.length / 10);
        if (pageNumCurrent > newpagenum){
            setPageNumCurrent(Math.max(newpagenum, 1));
        }
        return newpagenum;
    }, [allTasks]);
    
    const startIndex = (pageNumCurrent - 1) * 10;
    const endIndex = startIndex + 10;
    
    const filteredTasks = allTasks.slice(startIndex, endIndex);

    //make a function that slices the tasks baised on the current page number
    

    // Load workspaces and tasks when the page opens
    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            const [workspaceResult, taskResult] = await Promise.allSettled([
                getWorkspaces(),
                getAllTasksStats(selectedWorkspace)
            ]);

            if (cancelled) return;

            if (workspaceResult.status === "fulfilled") {
                setWorkspaces(workspaceResult.value);
            } else {
                console.error("Failed to load workspaces:", workspaceResult.reason);
            }

            if (taskResult.status === "fulfilled") {
                setAllTasks(taskResult.value);
            } else {
                console.error("Failed to load tasks:", taskResult.reason);
            }
        }

        loadData();

        return () => {
            cancelled = true;
        };
    }, []);

    async function reloadTasks() {
        await LoadAllTasks();
        
    }

    // Task statistics
    const taskStats = useMemo(() => {

        const stats = {
            daily: {
                completed: 0,
                uncompleted: 0,
                completedOnTime: 0,
                completedLate: 0
            },
            weekly: {
                completed: 0,
                uncompleted: 0,
                completedOnTime: 0,
                completedLate: 0
            },
            monthly: {
                completed: 0,
                uncompleted: 0,
                completedOnTime: 0,
                completedLate: 0
            }
        };

        const totals = {
            completedOnTime: 0,
            completedLate: 0,
            overdue: 0,
            toDo: 0
        };

        allTasks.forEach(task => {

            const completedDate = task.completed_at?.slice(0, 10);

            const completedOnTime =
                task.status === "completed" &&
                completedDate !== undefined &&
                completedDate <= task.due_date;

            const completedLate =
                task.status === "completed" &&
                completedDate !== undefined &&
                completedDate > task.due_date;

            // Overall statistics
            if (completedOnTime) {
                totals.completedOnTime++;
            } else if (completedLate) {
                totals.completedLate++;
            } else if (task.status === "todo") {
                if (today > task.due_date) {
                    totals.overdue++;
                } else {
                    totals.toDo++;
                }
            }

            // Task type statistics
            const type = task.task_type;

            if (type !== "daily" && type !== "weekly" && type !== "monthly") {
                return;
            }

            if (task.status === "completed") {
                stats[type].completed++;

                if (completedOnTime) {
                    stats[type].completedOnTime++;
                } else if (completedLate) {
                    stats[type].completedLate++;
                }
            } else if (task.status === "todo") {
                stats[type].uncompleted++;
            }
        });

        return { ...stats, totals };

    }, [allTasks, today]);

    

    // Daily
    const dailyCompleted = taskStats.daily.completed;
    const dailyUncompleted = taskStats.daily.uncompleted;
    const dailyProgress = getProgress(dailyCompleted, dailyUncompleted);

    // Weekly
    const weeklyCompleted = taskStats.weekly.completed;
    const weeklyUncompleted = taskStats.weekly.uncompleted;
    const weeklyProgress = getProgress(weeklyCompleted, weeklyUncompleted);

    // Monthly
    const monthlyCompleted = taskStats.monthly.completed;
    const monthlyUncompleted = taskStats.monthly.uncompleted;
    const monthlyProgress = getProgress(monthlyCompleted, monthlyUncompleted);

    // Overall statistics
    const totalCompletedOnTime = taskStats.totals.completedOnTime;
    const totalCompletedLate = taskStats.totals.completedLate;
    const totalOverdue = taskStats.totals.overdue;
    const totalToDo = taskStats.totals.toDo;

    const totalTaskLength =
        totalCompletedOnTime +
        totalCompletedLate +
        totalOverdue +
        totalToDo;

    const totalCompleted = totalCompletedOnTime + totalCompletedLate;

    const totalCompletedOnTimeProgress = getProgress(
        totalCompletedOnTime,
        totalCompletedLate
    );

    const totalCompletedLateProgress = getProgress(
        totalCompletedLate,
        totalCompletedOnTime
    );

    const totalCompletedProgress = getProgress(
        totalCompleted,
        totalOverdue + totalToDo
    );

    // Chart date range
    const [startDate, setStartDate] = useState(getDefaultStartDate);
    const [endDate, setEndDate] = useState(() => getLocalDate(new Date()));

    const filteredTaskStats = useMemo(() => {
    const totals = {
        completedOnTime: 0,
        completedLate: 0,
        overdue: 0,
        toDo: 0
    };

    allTasks.forEach(task => {
        const completedDate = task.completed_at?.slice(0, 10);

        // Only include tasks within the selected date range
        if (task.status === "completed") {
            if (!completedDate || completedDate < startDate || completedDate > endDate) {
                return;
            }

            if (completedDate <= task.due_date) {
                totals.completedOnTime++;
            } else {
                totals.completedLate++;
            }
        } else if (task.status === "todo") {
            // Use the due date for outstanding tasks
            if (task.due_date < startDate || task.due_date > endDate) {
                return;
            }

            if (task.due_date < today) {
                totals.overdue++;
            } else {
                totals.toDo++;
            }
        }
    });

    return totals;
    }, [allTasks, startDate, endDate, today]);

    const dailyStats = useMemo(() => {

        const stats: {
            date: string;
            day: string;
            completed: number;
            late: number;
        }[] = [];

        if (!startDate || !endDate || startDate > endDate) {
            return [];
        }

        // Generate dates for the selected range
        const currentDate = new Date(`${startDate}T00:00:00`);
        const lastDate = new Date(`${endDate}T00:00:00`);

        while (currentDate <= lastDate) {
            const dateKey = getLocalDate(currentDate);

            stats.push({
                date: dateKey,
                day: currentDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short"
                }),
                completed: 0,
                late: 0
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Create a lookup for each date
        const statsByDate = new Map(
            stats.map(day => [day.date, day])
        );

        // Count completed task occurrences
        allTasks.forEach(task => {

            if (task.status !== "completed" || !task.completed_at) {
                return;
            }

            const completedDate = task.completed_at.slice(0, 10);

            if (completedDate < startDate || completedDate > endDate) {
                return;
            }

            const dayStats = statsByDate.get(completedDate);

            if (!dayStats) return;

            if (completedDate <= task.due_date) {
                dayStats.completed++;
            } else {
                dayStats.late++;
            }
        });

        return stats.map(({ day, completed, late }) => ({
            day,
            completed,
            late
        }));

    }, [allTasks, startDate, endDate]);

    // Add task form
    const [title, setTitle] = useState("");
    const [discription, setDiscription] = useState("");
    const [taskType, setTaskType] = useState("daily");
    const [dueDate, setDueDate] = useState(today);
    const [workspaceId, setWorkspaceId] = useState<number | null>(null);

    // Set default workspace
    useEffect(() => {
        if (workspaces.length > 0 && workspaceId === null) {
            setWorkspaceId(workspaces[0].id);
        }
    }, [workspaces, workspaceId]);

    // Add task
    async function AddTask(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (workspaceId === null) {
            console.error("Please select a workspace.");
            return;
        }

        try {
            await addTask(title, discription, workspaceId, taskType, dueDate);

            // Reset form
            setTitle("");
            setDiscription("");
            setTaskType("daily");
            setDueDate(today);

            // Reload database tasks
            await reloadTasks();

        } catch (error) {
            console.error("Failed to add task:", error);
        }
    }

    useEffect(() => {
        LoadAllTasks();
        
    }, [selectedWorkspace]);

  

  return (
    <div className="home-layout">
        <SideNavBar />

        <div className="content">
        <div className="workspace-info">
            <div className="workspace-current">
            <FontAwesomeIcon icon={faTableList} />
            <span className="workspace-separator">|</span>
            <span>Statistics</span>
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

        <div className="dashboard-stats">
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
                            <p>{totalCompletedProgress}%</p>
                        <p className="tasks-compleation-progress-overview-text">
                            {totalCompletedLate + totalCompletedOnTime} of {totalTaskLength} tasks
                        </p>
                        </div>
                    </p>                    
                </div>
                <div className="overview-progress-bar">
                    <div
                        className="overview-progress-fill"
                        style={{ width: `${totalCompletedProgress}%` }}
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
                            <p>{totalCompletedOnTime}</p>
                        <p className="tasks-compleation-time-overview-text">
                            {totalCompletedOnTimeProgress}% of compleated
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
                            <p>{totalCompletedLate}</p>
                        <p className="tasks-compleation-late-overview-text">
                            {totalCompletedLateProgress}% of compleated
                        </p>
                        </div>
                    </p>
                </div>
                
              </div>
              
            </div>

            
            <div className="stats-chart-controls">
                <div className="stats-date-range">
                    <div className="stats-date-input">
                        <label htmlFor="start-date">Start Date</label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            max={endDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                    </div>

                    <span className="stats-date-separator">to</span>

                    <div className="stats-date-input">
                        <label htmlFor="end-date">End Date</label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            min={startDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="stats-collection-select">
                    <label htmlFor="collection-select">Collection</label>
                    <select
                        id="collection-select"
                        value={selectedWorkspace}
                        onChange={e => setSelectedWorkspace(e.target.value)}
                    >
                        <option value="all">All Collections</option>
                        {workspaces.map(workspace => (
                            <option key={workspace.id} value={String(workspace.id)}>
                                {workspace.name}
                            </option>
                        ))}
                    </select>
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
                            completed={filteredTaskStats.completedOnTime}
                            late={filteredTaskStats.completedLate}
                            todo={filteredTaskStats.toDo}
                            overdue={filteredTaskStats.overdue}
                        />
                        <div className="pie-chart-legend-slot">

                            <div className="pie-chart-legend-box">
                                <div className="pie-chart-legend-text" style={{ "--legend-color": "#8B91FF" } as React.CSSProperties}>
                                    <p>Completed on Time</p>
                                </div>
                                <div className="pie-chart-legend-number">
                                    <p>{filteredTaskStats.completedOnTime}</p>
                                </div>
                            </div>

                            <div className="pie-chart-legend-box">
                                <div className="pie-chart-legend-text" style={{ "--legend-color": "#F2B86A" } as React.CSSProperties}>
                                    <p>Completed Late</p>
                                </div>
                                <div className="pie-chart-legend-number">
                                    <p>{filteredTaskStats.completedLate}</p>
                                </div>
                            </div>

                            <div className="pie-chart-legend-box">
                                <div className="pie-chart-legend-text" style={{ "--legend-color": "#FF8A7D" } as React.CSSProperties}>
                                    <p>Overdue</p>
                                </div>
                                <div className="pie-chart-legend-number">
                                    <p>{filteredTaskStats.overdue}</p>
                                </div>
                            </div>

                            <div className="pie-chart-legend-box">
                                <div className="pie-chart-legend-text" style={{ "--legend-color": "#2A313B" } as React.CSSProperties}>
                                    <p>To Do</p>
                                </div>
                                <div className="pie-chart-legend-number">
                                    <p>{filteredTaskStats.toDo}</p>
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
                            <p>{dailyCompleted}/{dailyUncompleted + dailyCompleted}</p>
                            <h2>{dailyProgress}%</h2>
                        </div>
                    </div>
                    
                    <div className="overview-progress-bar">
                        <div
                            className="overview-progress-fill"
                            style={{ width: `${dailyProgress}%` }}
                        />
                    </div>
                </div>

                <div className="progress-task-type-box">
                    <div className="task-type-progress-title-slot">
                        <h2><FontAwesomeIcon style={{color: "#8B91FF"}} icon={faCircleCheck} /> Weekly</h2>
                        <div className="task-type-progress-title-percentage">
                            <p>{weeklyCompleted}/{weeklyUncompleted + weeklyCompleted}</p>
                            <h2>{weeklyProgress}%</h2>
                        </div>
                    </div>
                    
                    <div className="overview-progress-bar">
                        <div
                            className="overview-progress-fill"
                            style={{ width: `${weeklyProgress}%` }}
                        />
                    </div>
                </div>

                <div className="progress-task-type-box">
                    <div className="task-type-progress-title-slot">
                        <h2><FontAwesomeIcon style={{color: "#8B91FF"}} icon={faCircleCheck} /> Monthly</h2>
                        <div className="task-type-progress-title-percentage">
                            <p>{monthlyCompleted}/{monthlyUncompleted + monthlyCompleted}</p>
                            <h2>{monthlyProgress}%</h2>
                        </div>
                    </div>
                    
                    <div className="overview-progress-bar">
                        <div
                            className="overview-progress-fill"
                            style={{ width: `${monthlyProgress}%` }}
                        />
                    </div>
                </div>

            </div>

            {/* Display completed tasks ordered by due date */}
            <div className="task-compleation-history-slot">

                <div className="task-compleation-title">
                    <h2>Task Completion History</h2>
                    <p>Here is your task history</p>
                </div>

                <TaskHistory allTasks={filteredTasks} />
                <div className="task-history-bottom-bar">
                <div className="task-histroy-total-showing">
                    <p>Showing {startIndex + 1} to { endIndex <= allTasks.length ? (endIndex) : (allTasks.length)} of {allTasks.length}</p>
                </div>


                <div className="task-history-pages-control">
                    <p>Page {pageNumCurrent} of {pageNumTotal}</p>
                    <div className="task-history-pages-control-buttons-slot">

                        <button className="task-history-pages-control-button" disabled={pageNumCurrent <= 1} 
                        onClick={() => {setPageNumCurrent(pageNumCurrent-1)}}>
                            <FontAwesomeIcon icon={faAngleLeft} /></button>

                        <button className="task-history-pages-control-button" disabled={pageNumCurrent >= pageNumTotal} 
                        onClick={() => {setPageNumCurrent(pageNumCurrent+1)}}>
                            <FontAwesomeIcon icon={faAngleRight} /></button>
                    </div>
                    
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
                    <h5>Scheduled Date</h5>
                    <input
                        className="add-task-text-input"
                        required
                        id="taskDate"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
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