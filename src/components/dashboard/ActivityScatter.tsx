import { useState, useEffect } from 'react';
import { ChartContainer } from '@/components/ui/chart';
import { ActivityItem } from '@/lib/dashboardData';
import { BookOpen, CheckCircle, Target, Trophy, Play } from 'lucide-react';

interface ProgressJourneyProps {
  activities: ActivityItem[];
}

export default function ProgressJourney({ activities }: ProgressJourneyProps) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredMilestone, setHoveredMilestone] = useState(null);

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(100);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Helper functions for date handling
  const formatDate = (date, format) => {
    const options = format === 'EEE' 
      ? { weekday: 'short' }
      : { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const subDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  };

  const startOfDay = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  // Create data for the last 7 days
  const today = new Date();
  
  // Group activities by day
  const weekData = [];
  
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, 6 - i);
    const dayStart = startOfDay(date);
    
    const dayActivities = activities.filter(activity => {
      if (!activity.timestamp) return false;
      const activityDate = startOfDay(activity.timestamp);
      return activityDate.getTime() === dayStart.getTime();
    });

    weekData.push({
      day: i,
      date: date,
      dayLabel: formatDate(date, 'EEE'),
      dateLabel: formatDate(date, 'MMM d'),
      activities: dayActivities,
      totalActivities: dayActivities.length,
      xp: dayActivities.reduce((sum, act) => sum + (act.xp || 0), 0)
    });
  }

  // Create wavy path points
  const pathWidth = 600;
  const pathHeight = 200;
  const margin = { top: 40, right: 40, bottom: 60, left: 40 };

  const createWavyPath = () => {
    const points = [];
    const amplitude = 30; // Wave height
    const frequency = 1.5; // Wave frequency
    const baseY = pathHeight / 2;

    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * pathWidth;
      const wave = Math.sin((i / 100) * Math.PI * frequency) * amplitude;
      const y = baseY + wave;
      points.push([x, y]);
    }
    
    return `M ${points.map(p => p.join(',')).join(' L ')}`;
  };

  const getMilestonePosition = (dayIndex) => {
    const progress = dayIndex / 6; // 0 to 1
    const x = progress * pathWidth;
    const amplitude = 30;
    const frequency = 1.5;
    const baseY = pathHeight / 2;
    const wave = Math.sin(progress * Math.PI * frequency) * amplitude;
    const y = baseY + wave;
    
    return { x, y };
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'lesson_started': return <Play className="w-4 h-4" />;
      case 'lesson_completed': return <BookOpen className="w-4 h-4" />;
      case 'task_completed': return <CheckCircle className="w-4 h-4" />;
      case 'quiz_passed': return <Trophy className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'lesson_started': return 'hsl(var(--secondary))';
      case 'lesson_completed': return 'hsl(var(--primary))';
      case 'task_completed': return 'hsl(var(--success))';
      case 'quiz_passed': return 'hsl(var(--accent))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getMilestoneSize = (dayData) => {
    if (dayData.totalActivities === 0) return 'small';
    if (dayData.totalActivities >= 3) return 'large';
    return 'medium';
  };

  const getSizeValues = (size) => {
    switch (size) {
      case 'small': return { radius: 6, iconSize: 'w-3 h-3' };
      case 'medium': return { radius: 8, iconSize: 'w-4 h-4' };
      case 'large': return { radius: 12, iconSize: 'w-5 h-5' };
      default: return { radius: 8, iconSize: 'w-4 h-4' };
    }
  };

  const pathData = createWavyPath();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Weekly Progress Journey</h3>
        <p className="text-sm text-muted-foreground">
          Follow your learning path through the week. Each milestone represents a day's achievements.
        </p>
      </div>

      {/* SVG Journey Map */}
      <div className="relative bg-gradient-to-br from-background via-muted/20 to-background rounded-xl p-6 border">
        <svg
          width={pathWidth + margin.left + margin.right}
          height={pathHeight + margin.top + margin.bottom}
          className="w-full overflow-visible"
          viewBox={`0 0 ${pathWidth + margin.left + margin.right} ${pathHeight + margin.top + margin.bottom}`}
        >
          <defs>
            {/* Gradient for the path */}
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--muted))" />
              <stop offset="50%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
            
            {/* Animated gradient for glow effect */}
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              <stop offset={`${animationProgress}%`} stopColor="hsl(var(--accent))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>

            {/* Drop shadow filter */}
            <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="hsl(var(--primary))" floodOpacity="0.3"/>
            </filter>
          </defs>

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Background path */}
            <path
              d={pathData}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="2"
              opacity="0.3"
            />

            {/* Animated glowing path */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#glowGradient)"
              strokeWidth="4"
              opacity="0.8"
              style={{
                strokeDasharray: `${pathWidth * 2}`,
                strokeDashoffset: `${pathWidth * 2 - (animationProgress / 100) * pathWidth * 2}`,
                transition: 'stroke-dashoffset 3s ease-out',
                filter: 'url(#dropShadow)'
              }}
            />

            {/* Main colored path */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="3"
              opacity="0.7"
            />

            {/* Day milestones */}
            {weekData.map((dayData, index) => {
              const pos = getMilestonePosition(index);
              const size = getMilestoneSize(dayData);
              const sizeValues = getSizeValues(size);
              
              return (
                <g key={index} transform={`translate(${pos.x}, ${pos.y})`}>
                  {/* Milestone base circle */}
                  <circle
                    cx="0"
                    cy="0"
                    r={sizeValues.radius + 2}
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    className="transition-all duration-300"
                  />
                  
                  {/* Activity indicators */}
                  {dayData.activities.slice(0, 4).map((activity, actIndex) => {
                    const angle = (actIndex * 90) - 45; // Spread around circle
                    const radius = sizeValues.radius + 8;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;
                    
                    return (
                      <g
                        key={actIndex}
                        transform={`translate(${x}, ${y})`}
                        onMouseEnter={() => setHoveredMilestone({ day: index, activity: actIndex })}
                        onMouseLeave={() => setHoveredMilestone(null)}
                        className="cursor-pointer transition-transform duration-200 hover:scale-110"
                      >
                        <circle
                          cx="0"
                          cy="0"
                          r="6"
                          fill={getActivityColor(activity.type)}
                          stroke="hsl(var(--background))"
                          strokeWidth="1.5"
                          className="drop-shadow-sm"
                        />
                        <foreignObject x="-6" y="-6" width="12" height="12">
                          <div className="flex items-center justify-center w-full h-full text-background">
                            {getActivityIcon(activity.type)}
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })}

                  {/* Day marker */}
                  <circle
                    cx="0"
                    cy="0"
                    r={sizeValues.radius}
                    fill={dayData.totalActivities > 0 ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                    className="transition-all duration-300"
                  />

                  {/* XP indicator */}
                  {dayData.xp > 0 && (
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fontSize="10"
                      fill="hsl(var(--background))"
                      fontWeight="600"
                    >
                      {dayData.xp}
                    </text>
                  )}

                  {/* Day label below */}
                  <text
                    x="0"
                    y={sizeValues.radius + 25}
                    textAnchor="middle"
                    fontSize="11"
                    fill="hsl(var(--muted-foreground))"
                    fontWeight="500"
                  >
                    {dayData.dayLabel}
                  </text>
                  
                  <text
                    x="0"
                    y={sizeValues.radius + 38}
                    textAnchor="middle"
                    fontSize="9"
                    fill="hsl(var(--muted-foreground))"
                  >
                    {dayData.dateLabel}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredMilestone && (
          <div className="absolute top-4 left-4 bg-popover p-3 rounded-lg border shadow-lg z-10 max-w-xs">
            {(() => {
              const dayData = weekData[hoveredMilestone.day];
              const activity = dayData.activities[hoveredMilestone.activity];
              
              return (
                <div className="space-y-2">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p><span className="font-medium">Type:</span> {activity.type.replace('_', ' ')}</p>
                    <p><span className="font-medium">Course:</span> {activity.courseName}</p>
                    {activity.chapterName && (
                      <p><span className="font-medium">Chapter:</span> {activity.chapterName}</p>
                    )}
                    {activity.xp && (
                      <p><span className="font-medium">XP:</span> <span className="text-primary font-medium">{activity.xp}</span></p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-secondary" />
          <span className="text-muted-foreground">Started</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">Task Done</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent" />
          <span className="text-muted-foreground">Quiz Passed</span>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Activities</p>
          <p className="text-lg font-semibold text-primary">
            {weekData.reduce((sum, day) => sum + day.totalActivities, 0)}
          </p>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">Total XP</p>
          <p className="text-lg font-semibold text-accent">
            {weekData.reduce((sum, day) => sum + day.xp, 0)}
          </p>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">Active Days</p>
          <p className="text-lg font-semibold text-success">
            {weekData.filter(day => day.totalActivities > 0).length}/7
          </p>
        </div>
      </div>
    </div>
  );
}