/**
 * Dashboard data utilities
 * Aggregates progress from Google Sheets API for visualization
 */

import { Course, Chapter, Lesson, Task, fetchTasks, organizeTasks } from './csv';
import { ProgressManager, ProgressRow, deriveCompletedTaskIds, deriveCompletedLessonIds } from './ProgressManager';

const CSV_URL = import.meta.env.VITE_CSV_URL
  || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRrzHdNL8FRSooYojNPyBU2f66Tgr-DgwA6xB_HAK-azRx_s8PvbKUwzO5OzjzVdPGw-qeNOl68Asx6/pub?output=csv';

export interface ProgressData {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  totalLessons: number;
  completedLessons: number;
  totalXP: number;
  earnedXP: number;
}

export interface Activity {
  id: string;
  type: 'lesson_completed' | 'task_completed' | 'quiz_passed' | 'lesson_started';
  title: string;
  courseName: string;
  chapterName?: string;
  lessonName?: string;
  xp?: number;
  timestamp: Date | null; // null for pre-existing activities
}

export interface CourseProgress extends ProgressData {
  courseId: string;
  courseName: string;
}

export interface ChapterProgress extends ProgressData {
  chapterId: string;
  chapterName: string;
  courseId: string;
  courseName: string;
}

export interface DashboardProgress {
  overall: ProgressData;
  byCourse: CourseProgress[];
  byChapter: ChapterProgress[];
  activities: Activity[];
}

// Legacy interface for backward compatibility
export interface ActivityItem extends Activity {}

// Session activities for real-time tracking
let sessionActivities: Activity[] = [];

/**
 * Add activity to session storage for real-time dashboard updates
 */
export function addSessionActivity(activity: Omit<Activity, 'id' | 'timestamp'>) {
  const newActivity: Activity = {
    ...activity,
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date()
  };
  sessionActivities.push(newActivity);
  
  // Trigger dashboard update event
  window.dispatchEvent(new Event('dashboard:activity'));
  
  console.log('📊 Dashboard activity added:', newActivity);
}

/**
 * Get current session activities
 */
export function getSessionActivities(): Activity[] {
  return sessionActivities;
}

/**
 * Clear session activities (useful for testing)
 */
export function clearSessionActivities() {
  sessionActivities = [];
}

/**
 * Get dashboard data from Google Sheets API progress
 */
export async function getDashboardData(userId: string): Promise<DashboardProgress> {
  const courses = await fetchTasks(CSV_URL).then(organizeTasks);
  
  // Fetch all progress from API
  const progressRows = await ProgressManager.getAllProgress(userId);
  
  // Aggregate progress from API data
  const allProgress = aggregateProgressFromAPI(courses, progressRows);
  
  return allProgress;
}

/**
 * Aggregate progress data from API progress rows across all courses
 */
function aggregateProgressFromAPI(courses: Course[], progressRows: ProgressRow[]): DashboardProgress {
  const activities: Activity[] = [];
  
  let totalXP = 0;
  let earnedXP = 0;
  
  const byCourse: CourseProgress[] = [];
  const byChapter: ChapterProgress[] = [];

  courses.forEach(course => {
    // Get completed tasks and lessons for this course from API data
    const courseCompletedTasks = deriveCompletedTaskIds(progressRows, course.id);
    const courseCompletedLessons = deriveCompletedLessonIds(progressRows, course.id);
    
    let courseTotalTasks = 0;
    let courseCompletedCount = 0;
    let courseTotalLessons = 0;
    let courseCompletedLessonsCount = 0;
    let courseTotalXP = 0;
    let courseEarnedXP = 0;

    course.chapters.forEach(chapter => {
      let chapterTotalTasks = 0;
      let chapterCompletedCount = 0;
      let chapterTotalLessons = 0;
      let chapterCompletedLessonsCount = 0;
      let chapterTotalXP = 0;
      let chapterEarnedXP = 0;

      chapter.lessons.forEach(lesson => {
        chapterTotalLessons++;
        courseTotalLessons++;
        
        if (courseCompletedLessons.includes(lesson.id)) {
          chapterCompletedLessonsCount++;
          courseCompletedLessonsCount++;
        }

        lesson.tasks.forEach(task => {
          chapterTotalTasks++;
          courseTotalTasks++;
          chapterTotalXP += task.xp;
          courseTotalXP += task.xp;
          totalXP += task.xp;

          if (courseCompletedTasks.includes(task.id)) {
            chapterCompletedCount++;
            courseCompletedCount++;
            chapterEarnedXP += task.xp;
            courseEarnedXP += task.xp;
            earnedXP += task.xp;

            // Find the progress row for this task to get timestamp
            const taskProgressRow = progressRows.find(row => 
              row.progress_type === 'completed_tasks' && 
              row.task_id === task.id &&
              row.course_id === course.id
            );

            activities.push({
              id: `api_task_${task.id}`,
              type: 'task_completed',
              title: task.title || `Task ${task.id}`,
              courseName: course.name,
              chapterName: chapter.name,
              lessonName: lesson.name,
              xp: task.xp,
              timestamp: taskProgressRow?.updated_at ? new Date(taskProgressRow.updated_at) : null
            });
          }
        });
      });

      // Store chapter progress
      byChapter.push({
        chapterId: chapter.id,
        chapterName: chapter.name,
        courseId: course.id,
        courseName: course.name,
        totalTasks: chapterTotalTasks,
        completedTasks: chapterCompletedCount,
        completionPercentage: chapterTotalTasks > 0 ? Math.round((chapterCompletedCount / chapterTotalTasks) * 100) : 0,
        totalLessons: chapterTotalLessons,
        completedLessons: chapterCompletedLessonsCount,
        totalXP: chapterTotalXP,
        earnedXP: chapterEarnedXP
      });
    });

    // Store course progress
    byCourse.push({
      courseId: course.id,
      courseName: course.name,
      totalTasks: courseTotalTasks,
      completedTasks: courseCompletedCount,
      completionPercentage: courseTotalTasks > 0 ? Math.round((courseCompletedCount / courseTotalTasks) * 100) : 0,
      totalLessons: courseTotalLessons,
      completedLessons: courseCompletedLessonsCount,
      totalXP: courseTotalXP,
      earnedXP: courseEarnedXP
    });
  });

  // Add lesson completion activities
  progressRows
    .filter(row => row.progress_type === 'completed_lessons' && row.progress_value === true)
    .forEach(row => {
      const course = courses.find(c => c.id === row.course_id);
      const chapter = course?.chapters.find(ch => ch.lessons.some(l => l.id === row.lesson_id));
      const lesson = chapter?.lessons.find(l => l.id === row.lesson_id);

      if (course && chapter && lesson) {
        activities.push({
          id: `api_lesson_${row.lesson_id}`,
          type: 'lesson_completed',
          title: lesson.name,
          courseName: course.name,
          chapterName: chapter.name,
          lessonName: lesson.name,
          xp: lesson.tasks.reduce((sum, task) => sum + task.xp, 0),
          timestamp: row.updated_at ? new Date(row.updated_at) : null
        });
      }
    });

  const overall: ProgressData = {
    totalTasks: courses.reduce((sum, course) => sum + course.chapters.reduce((chSum, ch) => chSum + ch.lessons.reduce((lSum, lesson) => lSum + lesson.tasks.length, 0), 0), 0),
    completedTasks: deriveCompletedTaskIds(progressRows, '').length, // All completed tasks across all courses
    completionPercentage: totalXP > 0 ? Math.round((earnedXP / totalXP) * 100) : 0,
    totalLessons: courses.reduce((sum, course) => sum + course.chapters.reduce((chSum, ch) => chSum + ch.lessons.length, 0), 0),
    completedLessons: deriveCompletedLessonIds(progressRows, '').length, // All completed lessons across all courses
    totalXP,
    earnedXP
  };

  return {
    overall,
    byCourse,
    byChapter,
    activities: activities.sort((a, b) => {
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    })
  };
}

/**
 * Legacy functions from localStorage (for backward compatibility)
 */
function getCompletedTasksFromStorage(courseId: string): string[] {
  const completedKey = `course_${courseId}_completed_tasks`;
  const localTasks = JSON.parse(localStorage.getItem(completedKey) || '[]');
  const sessionTasks = JSON.parse(sessionStorage.getItem(completedKey) || '[]');
  return [...new Set([...localTasks, ...sessionTasks])];
}

function getCompletedLessonsFromStorage(courseId: string): string[] {
  const learningKey = `course_${courseId}_completed_lessons`;
  return JSON.parse(localStorage.getItem(learningKey) || '[]');
}