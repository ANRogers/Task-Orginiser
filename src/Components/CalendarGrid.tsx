
import { useState } from 'react';
import '../styles/Calendar.css';
import CalendarDay from './CalendarDay';

import { 
  type Task
 } from "../services/TaskService";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faAngleLeft, faAngleRight
 } from '@fortawesome/free-solid-svg-icons';

export default function CalendarPage({
    tasks,
    selectedDate,
    setSelectedDate
}:{
    tasks: Map<string, Task[]>;
    selectedDate: Date;
    setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
}) {
   const [currentDate, setCurrentDate] = useState(new Date());
   

   //set to the current month
   function goToToday() {
    setCurrentDate(new Date());
   };

   //move calendar to the next month
   function moveNextMonth() {
    setCurrentDate(new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
    ));
   };

   //move calendar to the prevous month
   function movePrevMonth() {
    setCurrentDate(new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
    ));
   };


   //get the days of the month to display
   function getCalendarDays() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();


    const firstDay = new Date(year, month, 1);

    //convert from a sunday index to a monday index for better display
    const startOffset = (firstDay.getDay() + 6) % 7;

    //make sure that the calendar days starts on a monday for display
    const calendarStart = new Date(year, month,1 - startOffset);

    return Array.from({length: 42}, (_, i) => {
        const day = new Date(calendarStart);
        day.setDate(calendarStart.getDate() + i);
        return day;
    });

   };

   //get the month display name
   const monthName = currentDate.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
   });

   const days = getCalendarDays();

    return (
        <div className='calendar-page'>
            <div className='calendar-header'>
                
                <h2>{monthName}</h2>
                
                

                <div className='calendar-navigation-right'>
                    <button className='calendar-option' onClick={goToToday}>
                        Today
                    </button>
                    <button className='calendar-option' onClick={movePrevMonth}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </button>
                    <button className='calendar-option' onClick={moveNextMonth}>
                        <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                </div>

            </div>

            <div className='calendar-grid'>
                {/* Weekday headings */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div className="calendar-weekday" key={day}>
                        {day}
                    </div>
                ))}

                {/* Calendar Days */}
                {days.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    const isToday = day.toDateString() === new Date().toDateString();

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const checkDay = new Date(day);
                    checkDay.setHours(0, 0, 0, 0);

                    const isOverdue = checkDay.getTime() < today.getTime();

                    const dayString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;

                    const todaysTasks = tasks.get(dayString) ?? [];

                    const isSelected = day.toDateString() === selectedDate.toDateString();

                    return (
                        <CalendarDay
                            key={index}
                            day={day}
                            tasks={todaysTasks}
                            isCurrentMonth={isCurrentMonth}
                            isToday={isToday}
                            isSelected={isSelected}
                            isOverdue={isOverdue}
                            onClick={() => setSelectedDate(day)}
                        />
                    );
                })}
                
            </div>
                <div className='calendar-bottom'>
                    <span className='cal-key'>Daily</span>
                    <span className='cal-key weekly'>Weekly</span>
                    <span className='cal-key monthly'>Monthly</span>
                    <span className='cal-key overdue'>Overdue</span>
                </div>
        </div>
    );
}

