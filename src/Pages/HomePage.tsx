import { useState, useEffect } from "react";
import * as SunCalc from "suncalc";

import SideNavBar from "../Components/SideNav"
import "../styles/HomePage.css"
import "../styles/WorkSpaceBar.css"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faRepeat, 
  faPlus, faCircleExclamation, faArrowRight, 
  faSquareArrowUpRight, faTableList, faSun, faMoon,
  faCalendarWeek, faList, faCircleCheck, faClock
 } from '@fortawesome/free-solid-svg-icons';

  
export default function HomePage() {

  //date and time
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Bristol coordinates
  const latitude = 51.4545;
  const longitude = -2.5879;

  const sun_times = SunCalc.getTimes(currentTime,latitude,longitude);

  const is_sun_up = currentTime >= sun_times.sunrise && currentTime < sun_times.sunset;

  // todays tasks
  let total_daily_tasks_num = 1;
  let total_weekly_tasks_num = 1;
  let total_monthly_tasks_num = 0;
  let total_num_tasks = total_daily_tasks_num + total_weekly_tasks_num + total_monthly_tasks_num;

  //overdue tasks
  let total_overdue_tasks_num = 1;

  //up next tasks
  let total_upcomeing_tasks_num = 1;

  // compleated today overview
  const completedTasks = 2;
  const totalTasks = 5;

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
                <div className="topbar-newtask">
                <FontAwesomeIcon icon={faPlus} /> New Task
            </div>
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
                      <div className="tasks-option-box">
                        All Tasks
                      </div>
                      <div className="tasks-option-box">
                        To Do
                      </div>
                      <div className="tasks-option-box">
                        Compleated
                      </div>
                    </div>
                  </div>
                  <div className="todays-tasks-scroll-box">

                  <div className="task-type-title">
                    <FontAwesomeIcon icon={faSun} />
                    <h1>Daily Tasks</h1>
                    
                    <p>Here is todays tasks!</p>
                  </div>
                  
                  <div className="daily-tasks-slot">

                    <div className="daily-task-box">
                      <div className="daily-task-box-left">
                        <input className="daily-task-checkbox" type="checkbox"></input>
                        <div className="task-text-slot">
                          <h1>Review Today's Priorities</h1>
                          <p className="collections-text">Work</p>
                        </div>
                      </div>
                      <div className="daily-task-box-right">
                          <button className="repeat-daily-btn">
                              <FontAwesomeIcon icon={faRepeat} />
                              Daily
                          </button>

                          <button className="task-options-btn" aria-label="Task options">
                              <FontAwesomeIcon icon={faEllipsisVertical} />
                          </button>
                      </div>
                    </div>

                   

                    

                  </div>
                  <div className="task-type-title">
                    <FontAwesomeIcon icon={faCalendarWeek} />                        
                    <h1>Weekly Tasks</h1>
                    
                    <p>Here is your weekly tasks!</p>
                  </div>

                  <div className="daily-tasks-slot">
                    <div className="daily-task-box">
                      <div className="daily-task-box-left">
                        <input className="daily-task-checkbox" type="checkbox"></input>
                        <div className="task-text-slot">
                          <h1>Send weekly project update</h1>
                          <p className="collections-text">Work</p>
                        </div>
                      </div>
                      <div className="daily-task-box-right">
                          <button className="repeat-daily-btn">
                              <FontAwesomeIcon icon={faRepeat} />
                              Weekly
                          </button>

                          <button className="task-options-btn" aria-label="Task options">
                              <FontAwesomeIcon icon={faEllipsisVertical} />
                          </button>
                      </div>
                
                    </div>
                  </div>
                  <div className="add-task-box">
                    <button><FontAwesomeIcon className="add-task-icon" icon={faPlus} /> Add a task for today</button>
                  </div>
                  </div>
                </div>

                <div className="monthly-task">
                  <div className="monthly-task-date">
                    <p className="monthly-task-date-text">OCT</p>
                    <p className="monthly-task-date-text">10</p>
                  </div>
                  <div className="next-monthly-task-text">
                    <p>Next Monthly Task</p>
                    <h1>Review monthly budget</h1>
                  </div>

                </div>
              </div>
              <div className="overdue-tasks-slot">
                <div className="overdue-tasks">
                  <div className="todays-tasks-title">
                    <h1> <FontAwesomeIcon icon={faCircleExclamation} /> Overdue</h1>
                    <p className="overdue-number" id="overdue-number"> {total_overdue_tasks_num}</p>
                  </div>
                  <p className="overdue-under-title-text">A new day to get these back on track.</p>
                  
                  <div className="side-bar-tasks-slot">
                  <div className="side-bar-tasks-scroll">

                    <div className="side-bar-task-box">
                        <input className="overdue-task-checkbox" type="checkbox"></input>
                        <div className="task-text-slot">
                          <h1>Send weekly project update</h1>
                          <div className="side-bar-task-info">
                            <p className="collections-text">Work</p>
                            <p className="collections-text"> · </p>
                            <p className="collections-text">Due Oct 7</p>
                            <p className="collections-text"> · </p>
                            <p className="collections-text">2 days overdue</p>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>

                </div>
                <div className="upcomeing-tasks">
                  <div className="todays-tasks-title">
                    <h1>Up Next</h1>
                    <p className="task-number" id="upcomming-number"> {total_upcomeing_tasks_num}</p>
                  </div>
                  <p className="overdue-under-title-text">A new day to get these back on track.</p>
                  
                  <div className="side-bar-tasks-slot">
                    <div className="side-bar-tasks-scroll">
                    <div className="side-bar-task-box up-next-box">
                        <input className="daily-task-checkbox" type="checkbox"></input>
                        <div className="task-text-slot">
                          <h1>Send weekly project update</h1>
                          <div className="side-bar-task-info">
                            <p className="collections-text">Work</p>
                            <p className="collections-text"> · </p>
                            <p className="collections-text">Daily</p>
                          </div>
                        </div>
                      </div>

                      </div>

                      <div className="see-calander-box">
                        
                        <button className="see-calander-button">See your calendar <FontAwesomeIcon icon={faArrowRight} /></button>
                  
                      </div>
                      
                  </div>
                 
                </div>
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}