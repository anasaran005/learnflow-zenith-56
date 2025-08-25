/**
 * Scatter plot for weekly activity visualization with dots for each activity
 */

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Activity } from '@/lib/dashboardData';
import { format, subDays, startOfDay, differenceInDays } from 'date-fns';

interface ActivityScatterProps {
  activities: Activity[];
}

export default function ActivityScatter({ activities }: ActivityScatterProps) {
  // Create data for the last 7 days
  const today = new Date();
  const sevenDaysAgo = subDays(today, 6);
  
  // Group activities by day and type
  const activityData: any[] = [];
  
  // Generate chart data for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, 6 - i);
    const dayStart = startOfDay(date);
    
    // Find activities for this day
    const dayActivities = activities.filter(activity => {
      if (!activity.timestamp) return false;
      const activityDate = startOfDay(activity.timestamp);
      return activityDate.getTime() === dayStart.getTime();
    });
    
    // Add each activity as a point
    dayActivities.forEach((activity, index) => {
      activityData.push({
        x: i, // Day index (0-6)
        y: getActivityTypeValue(activity.type) + (Math.random() - 0.5) * 0.3, // Add slight jitter
        day: format(date, 'MMM d'),
        activity,
        color: getActivityColor(activity.type)
      });
    });
    
    // If no activities for this day, add an empty marker
    if (dayActivities.length === 0) {
      activityData.push({
        x: i,
        y: 0,
        day: format(date, 'MMM d'),
        activity: null,
        color: 'hsl(var(--muted))'
      });
    }
  }

  // Add undated activities at the end
  const undatedActivities = activities.filter(activity => !activity.timestamp);
  undatedActivities.slice(0, 10).forEach((activity, index) => {
    activityData.push({
      x: 7 + (index * 0.1), // Spread them out slightly
      y: getActivityTypeValue(activity.type) + (Math.random() - 0.5) * 0.2,
      day: 'Recent',
      activity,
      color: getActivityColor(activity.type)
    });
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0].payload.activity) {
      const data = payload[0].payload;
      const activity: Activity = data.activity;
      return (
        <div className="bg-popover p-4 rounded-lg border border-border shadow-lg max-w-xs">
          <div className="space-y-2">
            <p className="text-popover-foreground font-medium">{activity.title}</p>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Type:</span> {getActivityTypeLabel(activity.type)}</p>
              <p><span className="text-muted-foreground">Course:</span> {activity.courseName}</p>
              {activity.chapterName && (
                <p><span className="text-muted-foreground">Chapter:</span> {activity.chapterName}</p>
              )}
              {activity.xp && (
                <p><span className="text-muted-foreground">XP:</span> <span className="text-primary font-medium">{activity.xp}</span></p>
              )}
              <p><span className="text-muted-foreground">Date:</span> {
                activity.timestamp ? format(activity.timestamp, 'MMM d, yyyy') : 'Previously completed'
              }</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const xAxisTicks = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today', 'Recent'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weekly Activity Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          Each dot represents a completed activity. Hover for details.
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{
          lesson_completed: { label: 'Lesson Completed', color: 'hsl(var(--primary))' },
          task_completed: { label: 'Task Completed', color: 'hsl(var(--success))' },
          quiz_passed: { label: 'Quiz Passed', color: 'hsl(var(--accent))' },
          lesson_started: { label: 'Lesson Started', color: 'hsl(var(--secondary))' }
        }}>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart data={activityData} margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number"
                dataKey="x"
                domain={[0, 7.5]}
                tickCount={8}
                tickFormatter={(value) => xAxisTicks[Math.floor(value)] || ''}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                type="number"
                domain={[0, 4]}
                tickCount={5}
                tickFormatter={(value) => {
                  const labels = ['', 'Lesson Started', 'Lesson Completed', 'Task Completed', 'Quiz Passed'];
                  return labels[Math.floor(value)] || '';
                }}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter dataKey="y" fill="hsl(var(--primary))">
                {activityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.activity ? entry.color : 'transparent'}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm text-muted-foreground">Lesson Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-sm text-muted-foreground">Task Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            <span className="text-sm text-muted-foreground">Quiz Passed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span className="text-sm text-muted-foreground">Lesson Started</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getActivityTypeValue(type: Activity['type']): number {
  switch (type) {
    case 'lesson_started': return 1;
    case 'lesson_completed': return 2;
    case 'task_completed': return 3;
    case 'quiz_passed': return 4;
    default: return 0;
  }
}

function getActivityColor(type: Activity['type']): string {
  switch (type) {
    case 'lesson_started': return 'hsl(var(--secondary))';
    case 'lesson_completed': return 'hsl(var(--primary))';
    case 'task_completed': return 'hsl(var(--success))';
    case 'quiz_passed': return 'hsl(var(--accent))';
    default: return 'hsl(var(--muted))';
  }
}

function getActivityTypeLabel(type: Activity['type']): string {
  switch (type) {
    case 'lesson_started': return 'Lesson Started';
    case 'lesson_completed': return 'Lesson Completed';
    case 'task_completed': return 'Task Completed';
    case 'quiz_passed': return 'Quiz Passed';
    default: return 'Unknown';
  }
}