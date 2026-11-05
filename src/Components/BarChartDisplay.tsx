import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend
} from 'recharts';

interface DailyStats {
    day: string;
    completed: number;
    late: number;
}

interface StatsBarChartProps {
    data: DailyStats[];
}

export default function StatsBarChart({ data }: StatsBarChartProps) {
    return (
        <div className="stats-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    
                >
                    <CartesianGrid
                        strokeDasharray="0"
                        stroke="#2A313B"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="day"
                        stroke="#AAB2C0"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        stroke="#AAB2C0"
                        allowDecimals={false}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip
                        cursor={false}
                        contentStyle={{
                            backgroundColor: '#1A1F2A',
                            border: '1px solid #2A313B',
                            borderRadius: '8px',
                            color: '#FFFFFF'
                        }}
                    />

                    

                    <Bar
                        dataKey="completed"
                        name="Completed on Time"
                        stackId="completed"
                        fill="#8B91FF"
                        
                        
                    />

                    <Bar
                        dataKey="late"
                        name="Completed Late"
                        stackId="completed"
                        fill="#F2B86A"
                        
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}