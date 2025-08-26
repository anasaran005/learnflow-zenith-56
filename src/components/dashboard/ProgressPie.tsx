/**
 * Pie chart component for lesson progress visualization only
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface ProgressPieProps {
  data: {
    totalLessons: number;
    completedLessons: number;
    totalTasks: number;
    completedTasks: number;
    totalXP: number;
    earnedXP: number;
    completionPercentage: number;
  };
}

export default function ProgressPie({ data }: ProgressPieProps) {
  const chartData = [
    {
      name: 'Completed Lessons',
      value: data.completedLessons,
      color: 'hsl(var(--success))'  // Green for completed
    },
    {
      name: 'Pending Lessons',
      value: data.totalLessons - data.completedLessons,
      color: 'hsl(var(--destructive))'  // Red for pending
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-popover p-3 rounded-lg border border-border shadow-lg">
          <p className="text-popover-foreground font-medium">{data.name}</p>
          <p className="text-primary">{data.value} lessons</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ChartContainer config={{
        completed: { label: 'Completed', color: 'hsl(var(--success))' },
        pending: { label: 'Pending', color: 'hsl(var(--destructive))' }
      }}>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
      
      {/* Progress Summary */}
      <div className="mt-4 text-center space-y-2">
        <div className="text-3xl font-bold text-foreground">
          {data.completionPercentage}%
        </div>
        <div className="text-sm text-muted-foreground">
          {data.completedLessons} of {data.totalLessons} lessons completed
        </div>
       
      
      </div>
    </div>
  );
}