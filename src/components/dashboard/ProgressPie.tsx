/**
 * Pie chart component for overall progress visualization
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      color: 'hsl(var(--primary))'
    },
    {
      name: 'Pending Lessons',
      value: data.totalLessons - data.completedLessons,
      color: 'hsl(var(--muted))'
    }
  ];

  const taskData = [
    {
      name: 'Completed Tasks',
      value: data.completedTasks,
      color: 'hsl(var(--success))'
    },
    {
      name: 'Pending Tasks',
      value: data.totalTasks - data.completedTasks,
      color: 'hsl(var(--muted))'
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-popover p-3 rounded-lg border border-border shadow-lg">
          <p className="text-popover-foreground font-medium">{data.name}</p>
          <p className="text-primary">{data.value} items</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Lessons Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lesson Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            completed: { label: 'Completed', color: 'hsl(var(--primary))' },
            pending: { label: 'Pending', color: 'hsl(var(--muted))' }
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {data.completionPercentage}%
            </div>
            <div className="text-sm text-muted-foreground">
              {data.completedLessons} of {data.totalLessons} lessons completed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Task Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            completed: { label: 'Completed', color: 'hsl(var(--success))' },
            pending: { label: 'Pending', color: 'hsl(var(--muted))' }
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">
              {data.completedTasks} of {data.totalTasks} tasks completed
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}