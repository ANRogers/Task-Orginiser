import { useEffect, useRef, useState } from 'react';
import type { Task } from '../services/TaskService';
import { getMoonPhase } from '../services/MoonService';

interface CalendarDayProps {
    day: Date;
    tasks: Task[];
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isOverdue: boolean;
    onClick: () => void;
}

export default function CalendarDay({
    day,
    tasks,
    isCurrentMonth,
    isToday,
    isSelected,
    isOverdue,
    onClick
}: CalendarDayProps) {

    const dayRef = useRef<HTMLDivElement>(null);
    const [maxTasks, setMaxTasks] = useState(1);
    const moonPhase = getMoonPhase(day);

    const dailyTasks = tasks.filter(task => task.task_type === 'daily');

    const otherTasks = tasks.filter(task =>
        task.task_type === 'weekly' || task.task_type === 'monthly'
    );

    useEffect(() => {
        const element = dayRef.current;
        if (!element) return;

        const observer = new ResizeObserver(() => {
            const height = element.clientHeight;

            // Account for padding, date and daily task count
            const reservedSpace = 65;

            // Each task occupies approximately 22px
            const taskHeight = 22;

            const availableSpace = height - reservedSpace;

            setMaxTasks(Math.max(0, Math.floor(availableSpace / taskHeight)));
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    const displayedTasks = otherTasks.slice(0, maxTasks);
    const hiddenTasks = otherTasks.length - displayedTasks.length;

    return (
        <div
            ref={dayRef}
            onClick={onClick}
            className={`calendar-day ${
                !isCurrentMonth ? 'other-month' : ''
            } ${isSelected ? 'selected' : ''}`}
        >
            <div className='calendar-day-number-slot'>
                <span className={isToday ? 'today' : ''}>
                    {day.getDate()}
                </span>
                <div className="calendar-moon-phase" title={`${moonPhase.name} - ${moonPhase.illumination}% illuminated`}>
                    <span>{moonPhase.emoji}</span>
                </div>
            </div>
            

            {dailyTasks.length > 0 && (
                <p className="daily-tasks-num">
                    {dailyTasks.length} daily tasks
                </p>
            )}

            {displayedTasks.map(task => (
                <p
                    key={task.occurrence_id}
                    className={
                        isOverdue && task.status === 'todo'
                            ? 'overdue-task-cal-display'
                            : task.task_type === 'weekly'
                                ? 'weekly-task-cal-display'
                                : 'monthly-task-cal-display'
                    }
                >
                    {task.title}
                </p>
            ))}

            {hiddenTasks > 0 && (
                <p className="hidden-tasks">
                    +{hiddenTasks} more
                </p>
            )}
        </div>
    );
}