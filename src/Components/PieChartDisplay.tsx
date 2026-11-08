import {
    PieChart,
    Pie,
    ResponsiveContainer,
    
} from 'recharts';

import "../styles/Statistic.css"

interface StatsPieChartProps {
    completed: number;
    late: number;
    todo: number;
    overdue: number;
}



export default function StatsPieChart({
    completed,
    late,
    todo,
    overdue
}: StatsPieChartProps) {

    const data = [
        { name: 'Completed', value: completed, fill: '#8B91FF' },
        { name: 'Completed Late', value: late, fill: '#F2B86A' },
        { name: 'Overdue', value: overdue, fill: '#FF8A7D' },
        { name: 'To Do', value: todo, fill: '#2A313B' },
    ].filter(item => item.value > 0);

    return (
        <div className="stats-pie-chart">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="100%"
                    innerRadius="85%"
                    paddingAngle={0}
                    startAngle={90}
                    endAngle={-270}
                    animationDuration={400}
                    animationEasing="ease-out"
                    stroke="none"
                />

                <text
                    x="50%"
                    y="47%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#FFFFFF"
                    
                    fontWeight="bold"
                    className='pie-chart-inner-text'
                >
                    {Math.round(((completed + late) / (completed + late + todo + overdue)) * 100)}%
                </text>

                <text
                    x="50%"
                    y="62%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#A0A5B0"
                    
                    className='pie-chart-inner-text-complete'
                >
                    Completed
                </text>

                    
                    
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}