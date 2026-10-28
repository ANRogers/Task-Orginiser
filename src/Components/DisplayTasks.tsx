
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faRepeat,
  faPlus,
  faCalendarCheck,
  faCalendarDays,
  faInfoCircle,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

import "../styles/Tasks.css";

import {
  archiveTask,
  scheduleTask,
  addRepeat,
  removeRepeat,
  type DisplayTask,
} from "../services/TaskService";

export default function DisplayTasks({
  tasks,
  reloadTasks,
  onEditTask,
}: {
  tasks: DisplayTask[];
  reloadTasks: () => Promise<void>;
  onEditTask: (task: DisplayTask) => void;
}) {
  const [dueDate, setDueDate] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);

  const selectedTask = tasks.find(
    (task) => task.id === selectedTaskId
  );

  function openScheduleDialog(taskId: number) {
    setSelectedTaskId(taskId);
    setDueDate("");

    const dialog = document.getElementById(
      "ScheduleTaskOverlay"
    ) as HTMLDialogElement | null;

    dialog?.showModal();
  }

  async function handleScheduleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (selectedTaskId === null || dueDate === "" || isScheduling) {
      return;
    }

    try {
      setIsScheduling(true);

      await scheduleTask(selectedTaskId, dueDate);
      await reloadTasks();

      const dialog = document.getElementById(
        "ScheduleTaskOverlay"
      ) as HTMLDialogElement | null;

      dialog?.close();

      setSelectedTaskId(null);
      setDueDate("");
    } catch (error) {
      console.error("Failed to schedule task:", error);
    } finally {
      setIsScheduling(false);
    }
  }

  function closeScheduleDialog() {
    const dialog = document.getElementById(
      "ScheduleTaskOverlay"
    ) as HTMLDialogElement | null;

    dialog?.close();
    setSelectedTaskId(null);
    setDueDate("");
  }

  return (
    <div className="daily-tasks-slot">
      {tasks.map((task) => (
        <div className="daily-task-box" key={task.id}>
          <div className="daily-task-box-left">
            <div>
              <a
                className="discription-collapse"
                data-bs-toggle="collapse"
                href={`#collapsediscription-${task.id}`}
                role="button"
                aria-expanded="false"
                aria-controls={`collapsediscription-${task.id}`}
              >
                <h1>{task.title}</h1>

                <div className="side-bar-task-info">
                  <p
                    className="collections-text"
                    style={{ color: task.workspace_colour }}
                  >
                    {task.workspace_name}
                  </p>
                </div>
              </a>

              <div
                className="collapse"
                id={`collapsediscription-${task.id}`}
              >
                <div>{task.description}</div>
              </div>
            </div>
          </div>

          <div className="daily-task-box-right">
            

            

            <button
              className="task-options-btn"
              type="button"
              aria-label="Task options"
              data-bs-toggle="menu"
              aria-expanded="false"
            >
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>

            <div className="menu">
              <button
                type="button"
                className="menu-item"
                onClick={async () => {
                  await archiveTask(task.id);
                  await reloadTasks();
                }}
              >
                Archive task
              </button>

              <button
                type="button"
                className="menu-item"
                onClick={() => onEditTask(task)}
              >
                Modify task
              </button>

              <button
                type="button"
                className="menu-item"
                onClick={() => openScheduleDialog(task.id)}
              >
                Schedule task
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Schedule Task dialog */}
      <dialog
        className="dialog add-task-dialog schedule-task-dialog"
        id="ScheduleTaskOverlay"
      >
        <div className="dialog-header schedule-task-header">
          <div className="schedule-task-heading-icon">
            <FontAwesomeIcon icon={faCalendarCheck} />
          </div>

          <div>
            <h1 className="dialog-title">Schedule a task</h1>
            <p>Choose when you want to work on this task.</p>
          </div>
        </div>

        <form onSubmit={handleScheduleSubmit}>
          <div className="dialog-body schedule-task-body">
            <label className="schedule-task-label">TASK</label>

            <div className="schedule-task-preview">
              <FontAwesomeIcon icon={faCircleCheck} />

              <div className="schedule-task-preview-text">
                <h3>{selectedTask?.title ?? "Selected task"}</h3>

                <p>
                  {selectedTask?.workspace_name ?? "Workspace"}
                </p>
              </div>
            </div>

            <div className="add-task-date-collection-slot">
              <div className="add-task-input-box">
                <label
                  className="schedule-task-label"
                  htmlFor="scheduleTaskDate"
                >
                  SCHEDULED DATE
                </label>

                <div className="schedule-task-date-wrapper">
                  <FontAwesomeIcon icon={faCalendarDays} />

                  <input
                    className="add-task-text-input"
                    id="scheduleTaskDate"
                    required
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="schedule-task-hint">
              <FontAwesomeIcon icon={faInfoCircle} />

              <p>
                The task will be scheduled for your selected date.
              </p>
            </div>
          </div>

          <div className="dialog-footer schedule-task-footer">
            <button
              type="button"
              className="btn-solid theme-secondary add-task-cancel-btn"
              onClick={closeScheduleDialog}
              disabled={isScheduling}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-solid theme-secondary add-task-submit-btn"
              disabled={isScheduling}
            >
              <FontAwesomeIcon icon={faPlus} />
              {isScheduling ? "Scheduling..." : "Schedule task"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
