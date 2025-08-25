/**
 * Student Dashboard - Interactive progress visualization
 * Reads all progress from localStorage without modifying existing functionality
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressPie from '@/components/dashboard/ProgressPie';
import ProgressBars from '@/components/dashboard/ProgressBars';
import ActivityScatter from '@/components/dashboard/ActivityScatter';
import { getDashboardData, getSessionActivities, DashboardProgress } from '@/lib/dashboardData';
import { BookOpen, Award, Target, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Listen for progress updates
    const handleProgressUpdate = () => {
      loadDashboardData();
    };

    const handleStorageUpdate = () => {
      loadDashboardData();
    };

    const handleDashboardActivity = () => {
      loadDashboardData();
    };

    window.addEventListener('progress:updated', handleProgressUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('dashboard:activity', handleDashboardActivity);

    return () => {
      window.removeEventListener('progress:updated', handleProgressUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('dashboard:activity', handleDashboardActivity);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData();
      
      // Merge with session activities for real-time updates
      const sessionActivities = getSessionActivities();
      const allActivities = [...sessionActivities, ...data.activities];
      
      setDashboardData({
        ...data,
        activities: allActivities
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-destructive rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-destructive-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load Dashboard</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadDashboardData}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { overall, byCourse, byChapter, activities } = dashboardData;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-5">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
                WELCOME Back 👋🏻
              </h1>
              <p className="text-xl text-muted-foreground">
                Track your learning progress across all courses
              </p>
            </div>
            <Link to="/courses">
              <Button variant="outline" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Go to Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold text-foreground">{overall.completionPercentage}%</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Lessons Completed</p>
                  <p className="text-2xl font-bold text-foreground">{overall.completedLessons}/{overall.totalLessons}</p>
                </div>
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold text-foreground">{overall.completedTasks}/{overall.totalTasks}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-red-800" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">XP Earned</p>
                  <p className="text-2xl font-bold text-foreground">{overall.earnedXP}/{overall.totalXP}</p>
                </div>
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Overall Progress Pie Charts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Overall Progress</h2>
            </div>
            <ProgressPie data={overall} />
          </div>

          {/* Progress by Course/Chapter */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-success" />
              <h2 className="text-2xl font-semibold text-foreground">Progress by Course & Chapter</h2>
            </div>
            <ProgressBars courseData={byCourse} chapterData={byChapter} />
          </div>

          {/* Weekly Activity */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h- text-accent" />
              <h2 className="text-2xl font-semibold text-foreground">Weekly Activity</h2>
            </div>
            <ActivityScatter activities={activities} />
          </div>

          {/* Recent Activities List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-3 max-h-70 overflow-y-auto">
                  {activities.slice(0, 10).map((activity, index) => (
                    <div key={activity.id + index} className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.type === 'lesson_completed' ? 'bg-primary' :
                          activity.type === 'task_completed' ? 'bg-success' :
                          activity.type === 'quiz_passed' ? 'bg-accent' :
                          'bg-secondary'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.courseName} {activity.chapterName && `• ${activity.chapterName}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.xp && (
                          <p className="text-sm font-medium text-primary">+{activity.xp} XP</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp ? 
                            activity.timestamp.toLocaleDateString() : 
                            'Previously completed'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No activities recorded yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start completing lessons and tasks to see your progress here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}