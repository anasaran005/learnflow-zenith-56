/**
 * Bar chart component for progress per chapter/course
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { CourseProgress, ChapterProgress } from '@/lib/dashboardData';

interface ProgressBarsProps {
  courseData: CourseProgress[];
  chapterData: ChapterProgress[];
}

export default function ProgressBars({ courseData, chapterData }: ProgressBarsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover p-4 rounded-lg border border-border shadow-lg max-w-xs">
          <p className="text-popover-foreground font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p>Completed: <span className="text-primary font-medium">{data.completedLessons}</span></p>
            <p>Total: <span className="text-muted-foreground">{data.totalLessons}</span></p>
            <p>Progress: <span className="text-success font-medium">{data.completionPercentage}%</span></p>
            {data.earnedXP !== undefined && (
              <p>XP: <span className="text-primary font-medium">{data.earnedXP}</span>/{data.totalXP}</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const courseChartData = courseData.map(course => ({
    name: course.courseName.length > 20 ? 
      course.courseName.substring(0, 20) + '...' : 
      course.courseName,
    fullName: course.courseName,
    completedLessons: course.completedLessons,
    totalLessons: course.totalLessons,
    completionPercentage: course.completionPercentage,
    earnedXP: course.earnedXP,
    totalXP: course.totalXP
  }));

  const chapterChartData = chapterData.map(chapter => ({
    name: chapter.chapterName.length > 15 ? 
      chapter.chapterName.substring(0, 15) + '...' : 
      chapter.chapterName,
    fullName: `${chapter.courseName} - ${chapter.chapterName}`,
    completedLessons: chapter.completedLessons,
    totalLessons: chapter.totalLessons,
    completionPercentage: chapter.completionPercentage,
    earnedXP: chapter.earnedXP,
    totalXP: chapter.totalXP
  }));

  return (
    <div className="space-y-6">
      {/* Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progress by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            completedLessons: { label: 'Completed Lessons', color: 'hsl(var(--primary))' },
            totalLessons: { label: 'Total Lessons', color: 'hsl(var(--muted))' }
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="completedLessons" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Chapter Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progress by Chapter</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            completedLessons: { label: 'Completed Lessons', color: 'hsl(var(--success))' },
            totalLessons: { label: 'Total Lessons', color: 'hsl(var(--muted))' }
          }}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chapterChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="completedLessons" 
                  fill="hsl(var(--success))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}