
import { useState, useEffect, type FormEvent } from "react";
import * as SunCalc from "suncalc";

import SideNavBar from "../Components/SideNav";
import CalendarGrid from "../Components/CalendarGrid";
import SelectedTasks from "../Components/SelectedTasks";

import "../styles/HomePage.css";
import "../styles/WorkSpaceBar.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTableList,
  faSun,
  faMoon
} from "@fortawesome/free-solid-svg-icons";

import { addTask,
  getAllTasks,
  editTask,
  type Task
 } from "../services/TaskService";
import {
  getWorkspaces,
  type Workspace
} from "../services/WorkspaceService";
import { getMoonPhase } from '../services/MoonService';

export default function CalendarPage() {

  // Current date and time
  const [currentTime, setCurrentTime] = useState(new Date());
  

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const today =
    currentTime.getFullYear() + "-" +
    String(currentTime.getMonth() + 1).padStart(2, "0") + "-" +
    String(currentTime.getDate()).padStart(2, "0");

  // Sunrise and sunset
  const latitude = 51.4545;
  const longitude = -2.5879;

  const sun_times = SunCalc.getTimes(
    currentTime,
    latitude,
    longitude
  );

  const is_sun_up =
    sun_times.sunrise != null &&
    sun_times.sunset != null &&
    currentTime >= sun_times.sunrise &&
    currentTime < sun_times.sunset;

  //get all the tasks
  const [tasks, setTasks] = useState<Task[]>([]);

  

  async function loadTasks() {
    try{
      const temp_Tasks = await getAllTasks();
      setTasks(temp_Tasks);
    } catch(error){
      console.error("Failed to load tasks:", error);
    }

  }

  const tasksByDate = new Map<string, Task[]>();

  tasks.forEach(task => {
      const date = task.due_date;

      if (!tasksByDate.has(date)) {
          tasksByDate.set(date, []);
      }

      tasksByDate.get(date)!.push(task);
  });

  // Workspaces
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const collections = await getWorkspaces();
        setWorkspaces(collections);
      } catch (error) {
        console.error("Failed to load workspaces:", error);
      }
    }

    loadWorkspaces();
    loadTasks();
  }, []);

  //selected date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dayString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  // Get tasks for selected date
  const selectedTasks = tasksByDate.get(dayString) ?? [];

  // Count tasks by type
  const dailyCount = selectedTasks.filter(task => task.task_type === 'daily').length;

  const weeklyCount = selectedTasks.filter(task => task.task_type === 'weekly').length;

  const monthlyCount = selectedTasks.filter(task => task.task_type === 'monthly').length;

  const selectedCountTotal = dailyCount + weeklyCount + monthlyCount;

  //moon phase
  const moonPhase = getMoonPhase(selectedDate);
  // New task fields
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
  async function AddTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (workspaceId === null) {
      console.error("Please select a workspace.");
      return;
    }

    try {
      await addTask(
        title,
        discription,
        workspaceId,
        taskType,
        dueDate
      );

      // Reset form
      setTitle("");
      setDiscription("");
      setTaskType("daily");
      setDueDate(today);

    } catch (error) {
      console.error("Failed to add task:", error);
    }
  }

  // Edit task state
const [editingTask, setEditingTask] = useState<Task | null>(null);

const [titleEdit, setTitleEdit] = useState("");
const [discriptionEdit, setDiscriptionEdit] = useState("");
const [taskTypeEdit, setTaskTypeEdit] = useState("daily");
const [dueDateEdit, setDueDateEdit] = useState(today);
const [workspaceIdEdit, setWorkspaceIdEdit] = useState<number | null>(null);


// Open edit dialog
function openEditTask(task: Task) {
    setEditingTask(task);

    setTitleEdit(task.title);
    setDiscriptionEdit(task.description ?? "");
    setTaskTypeEdit(task.task_type);
    setDueDateEdit(task.due_date);
    setWorkspaceIdEdit(task.workspace_id);

    const dialog = document.getElementById("EditTaskOverlay");

    if (dialog instanceof HTMLDialogElement) {
        dialog.showModal();
    }
}


  // Save edited task
  async function EditTask(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      if (editingTask === null || workspaceIdEdit === null) return;

      try {
          await editTask(
              editingTask.id,
              editingTask.occurrence_id,
              titleEdit,
              discriptionEdit,
              workspaceIdEdit,
              taskTypeEdit,
              dueDateEdit
          );

          await loadTasks();

          const dialog = document.getElementById("EditTaskOverlay");

          if (dialog instanceof HTMLDialogElement) {
              dialog.close();
          }

          setEditingTask(null);

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
            <span>Calendar</span>
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
              <h2>Make space for what’s next.</h2>
              <p>Your routines, deadlines, and plans — all in one place.</p>
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

          <div className="tasks-slot">
            <div className="calendar-box-slot">
                <div className="todays-tasks">
                  <div className="calendar-dsiplay-area">
                    <CalendarGrid tasks={tasksByDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
                  </div>
                </div>
                
            </div>
            <div className="calendar-selected-slot">
                <div className="calendar-selected-tasks">
                  <div className="calendar-selected-task-title-display">
                    <p style={{color: "#8B91FF", fontSize: "12px", fontWeight: "600"}}>SELECTED DAY</p>
                    <div className="calendar-moon-phase" title={`${moonPhase.name} - ${moonPhase.illumination}% illuminated`}>
                      <span>{moonPhase.emoji}</span>
                      <span>{moonPhase.name}</span>
                    </div>
                  </div>

                  <h2 style={{fontSize: "21px"}}>
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric"
                    })}
                  </h2>
                  <p style={{color: "#AAB2C0",fontSize: "14px"}}>{selectedCountTotal} Tasks 
                    {dailyCount > 0 ? ( ` · ${dailyCount} Daily`): ''} 
                    {weeklyCount > 0 ? (` · ${weeklyCount} Weekly`): ''} 
                    {monthlyCount > 0 ? (` · ${monthlyCount} Monthly`): ''}  </p>   
                  
                  <SelectedTasks tasks={selectedTasks ?? []} reloadTasks={loadTasks} onEditTask={openEditTask} />
                   <div className="selected-add-box">
            
                    <button
                        data-bs-toggle="dialog"
                        data-bs-target="#AddTaskOverlay"
                        data-bs-backdrop="static"
                        onClick={() => setDueDate(dayString)}
                        className="selected-cal-newtask"
                    >
                        <FontAwesomeIcon icon={faPlus} /> Add Task to {selectedDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric"
                    })}
                    </button>
                
                    </div>
                  </div>
                  
                </div>
        </div>

        </div>

        {/* Add task overlay */}
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
                onClick={() => setDueDate(today)}
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

        {/* Edit task dialog */}
        <dialog className="dialog add-task-dialog" id="EditTaskOverlay">
            <div className="dialog-header">
                <h1 className="dialog-title">Edit task</h1>
            </div>

            <form onSubmit={EditTask}>
                <div className="dialog-body">

                    <div className="add-task-input-box">
                        <h5>Task Name</h5>
                        <input
                            className="add-task-text-input"
                            type="text"
                            value={titleEdit}
                            placeholder="Enter Task Name"
                            required
                            onChange={e => setTitleEdit(e.target.value)}
                        />
                    </div>

                    <div className="add-task-input-box">
                        <h5>Notes</h5>
                        <input
                            type="text"
                            className="add-task-text-input"
                            placeholder="Enter Notes"
                            value={discriptionEdit}
                            onChange={e => setDiscriptionEdit(e.target.value)}
                        />
                    </div>

                    <div className="add-task-input-box">
                        <h5>Task Type</h5>
                        <div className="add-task-type-radio-slot">

                            {(["daily", "weekly", "monthly"] as const).map(type => (
                                <label className="add-task-type-radio-box" key={type}>
                                    <div className="add-task-radio-top">
                                        <h5>{type.charAt(0).toUpperCase() + type.slice(1)}</h5>
                                        <input
                                            type="radio"
                                            name="taskTypeEdit"
                                            value={type}
                                            checked={taskTypeEdit === type}
                                            onChange={e => setTaskTypeEdit(e.target.value)}
                                        />
                                    </div>
                                </label>
                            ))}

                        </div>
                    </div>

                    <div className="add-task-date-collection-slot">
                        <div className="add-task-input-box">
                            <h5>Scheduled Date</h5>
                            <input
                                className="add-task-text-input"
                                required
                                type="date"
                                min={new Date().toISOString().split("T")[0]}
                                value={dueDateEdit}
                                onChange={e => setDueDateEdit(e.target.value)}
                            />
                        </div>

                        <div className="add-task-input-box">
                            <h5>Workspace</h5>
                            <select
                                className="add-task-collection"
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
