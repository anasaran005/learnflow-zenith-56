/**
 * Dashboard data extraction utilities for reading localStorage progress
 * Handles progress aggregation across courses, chapters, lessons, and tasks
 * Now filters to show only unlocked courses
 */

import { fetchTasks, organizeTasks, Course, Chapter, Lesson, Task } from './csv';

export interface DashboardProgress {
  overall: {
    totalLessons: number;
    completedLessons: number;
    totalTasks: number;
    completedTasks: number;
    totalXP: number;
    earnedXP: number;
    completionPercentage: number;
  };
  byCourse: CourseProgress[];
  byChapter: ChapterProgress[];
  activities: ActivityItem[];
}

export interface CourseProgress {
  courseId: string;
  courseName: string;
  totalLessons: number;
  completedLessons: number;
  totalTasks: number;
  completedTasks: number;
  totalXP: number;
  earnedXP: number;
  completionPercentage: number;
}

export interface ChapterProgress {
  chapterId: string;
  chapterName: string;
  courseId: string;
  courseName: string;
  totalLessons: number;
  completedLessons: number;
  totalTasks: number;
  completedTasks: number;
  totalXP: number;
  earnedXP: number;
  completionPercentage: number;
}

export interface ActivityItem {
  id: string;
  type: 'lesson_started' | 'lesson_completed' | 'task_completed' | 'quiz_passed';
  title: string;
  courseId: string;
  courseName: string;
  chapterId?: string;
  chapterName?: string;
  lessonId?: string;
  lessonName?: string;
  taskId?: string;
  timestamp: Date | null; // null for pre-existing activities
  xp?: number;
}

const CSV_URL = import.meta.env.VITE_CSV_URL || 
  'https://raw.githubusercontent.com/anasaran005/learnflow-zenith-56/a0d9572f1d8cb6a75180cc62ebbace2f75153ec5/coursecsv/pro%20training%20tasks%20-%20Sheet1.csv';

/**
 * Check if a course is unlocked based on your business logic
 * Currently matches the logic from CoursesIndex.tsx
 */
function isCourseUnlocked(course: Course): boolean {
  return course.name.toLowerCase().includes('qa/qc'); // Only unlock QA/QC courses
}

/**
 * Filter courses to only include unlocked ones
 * Also filters out dummy/test courses like in CoursesIndex.tsx
 */
function getUnlockedCourses(courses: Course[]): Course[] {
  return courses.filter(course => {
    const isValidCourse = (
      course.name && // Has a name
      course.name.trim() !== '' && // Name is not empty
      !course.name.toLowerCase().includes('dummy') && // Doesn't contain 'dummy'
      !course.name.toLowerCase().includes('test') && // Doesn't contain 'test'
      !course.name.toLowerCase().includes('sample') && // Doesn't contain 'sample'
      course.id && course.id.trim() !== '' && // Has a valid ID
      course.chapters && course.chapters.length > 0 // Has actual content
    );
    
    return isValidCourse && isCourseUnlocked(course);
  });
}

/**
 * Extract all progress data from localStorage and organize it for dashboard visualization
 * Now only processes unlocked courses
 */
export async function getDashboardData(): Promise<DashboardProgress> {
  try {
    // Load course structure
    const tasks = await fetchTasks(CSV_URL);
    const allCourses = organizeTasks(tasks);
    
    // Filter to only unlocked courses
    const courses = getUnlockedCourses(allCourses);

    const byCourse: CourseProgress[] = [];
    const byChapter: ChapterProgress[] = [];
    const activities: ActivityItem[] = [];

    let totalLessons = 0;
    let completedLessons = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    let totalXP = 0;
    let earnedXP = 0;

    for (const course of courses) {
      const courseCompletedTasks = getCompletedTasks(course.id);
      const courseCompletedLessons = getCompletedLessons(course.id);

      let courseTotalLessons = 0;
      let courseCompletedLessonsCount = 0;
      let courseTotalTasks = 0;
      let courseCompletedTasksCount = 0;
      let courseTotalXP = 0;
      let courseEarnedXP = 0;

      for (const chapter of course.chapters) {
        let chapterTotalLessons = 0;
        let chapterCompletedLessonsCount = 0;
        let chapterTotalTasks = 0;
        let chapterCompletedTasksCount = 0;
        let chapterTotalXP = 0;
        let chapterEarnedXP = 0;

        for (const lesson of chapter.lessons) {
          chapterTotalLessons++;
          courseTotalLessons++;
          totalLessons++;

          const isLessonComplete = isLessonCompleted(lesson, course.id, courseCompletedTasks, courseCompletedLessons);
          if (isLessonComplete) {
            chapterCompletedLessonsCount++;
            courseCompletedLessonsCount++;
            completedLessons++;

            // Add lesson completion activity
            activities.push({
              id: `lesson_${lesson.id}`,
              type: 'lesson_completed',
              title: lesson.name,
              courseId: course.id,
              courseName: course.name,
              chapterId: chapter.id,
              chapterName: chapter.name,
              lessonId: lesson.id,
              lessonName: lesson.name,
              timestamp: null // pre-existing activity
            });
          }

          // Check for quiz passed
          if (isQuizPassed(lesson.id)) {
            activities.push({
              id: `quiz_${lesson.id}`,
              type: 'quiz_passed',
              title: `${lesson.name} Quiz`,
              courseId: course.id,
              courseName: course.name,
              chapterId: chapter.id,
              chapterName: chapter.name,
              lessonId: lesson.id,
              lessonName: lesson.name,
              timestamp: null
            });
          }

          for (const task of lesson.tasks) {
            chapterTotalTasks++;
            courseTotalTasks++;
            totalTasks++;
            chapterTotalXP += task.xp;
            courseTotalXP += task.xp;
            totalXP += task.xp;

            if (courseCompletedTasks.includes(task.id)) {
              chapterCompletedTasksCount++;
              courseCompletedTasksCount++;
              completedTasks++;
              chapterEarnedXP += task.xp;
              courseEarnedXP += task.xp;
              earnedXP += task.xp;

              // Add task completion activity
              activities.push({
                id: `task_${task.id}`,
                type: 'task_completed',
                title: task.title,
                courseId: course.id,
                courseName: course.name,
                chapterId: chapter.id,
                chapterName: chapter.name,
                lessonId: lesson.id,
                lessonName: lesson.name,
                taskId: task.id,
                timestamp: null,
                xp: task.xp
              });
            }
          }
        }

        // Add chapter progress (only for unlocked courses)
        byChapter.push({
          chapterId: chapter.id,
          chapterName: chapter.name,
          courseId: course.id,
          courseName: course.name,
          totalLessons: chapterTotalLessons,
          completedLessons: chapterCompletedLessonsCount,
          totalTasks: chapterTotalTasks,
          completedTasks: chapterCompletedTasksCount,
          totalXP: chapterTotalXP,
          earnedXP: chapterEarnedXP,
          completionPercentage: chapterTotalLessons > 0 ? 
            Math.round((chapterCompletedLessonsCount / chapterTotalLessons) * 100) : 0
        });
      }

      // Add course progress (only for unlocked courses)
      byCourse.push({
        courseId: course.id,
        courseName: course.name,
        totalLessons: courseTotalLessons,
        completedLessons: courseCompletedLessonsCount,
        totalTasks: courseTotalTasks,
        completedTasks: courseCompletedTasksCount,
        totalXP: courseTotalXP,
        earnedXP: courseEarnedXP,
        completionPercentage: courseTotalLessons > 0 ? 
          Math.round((courseCompletedLessonsCount / courseTotalLessons) * 100) : 0
      });
    }

    return {
      overall: {
        totalLessons,
        completedLessons,
        totalTasks,
        completedTasks,
        totalXP,
        earnedXP,
        completionPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      },
      byCourse,
      byChapter,
      activities: activities.slice(0, 50) // limit to recent 50 activities
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    throw error;
  }
}

/**
 * Helper functions to read from localStorage
 */
function getCompletedTasks(courseId: string): string[] {
  const completedKey = `course_${courseId}_completed_tasks`;
  const localTasks = JSON.parse(localStorage.getItem(completedKey) || '[]');
  const sessionTasks = JSON.parse(sessionStorage.getItem(completedKey) || '[]');
  return [...new Set([...localTasks, ...sessionTasks])];
}

function getCompletedLessons(courseId: string): string[] {
  const learningKey = `course_${courseId}_completed_lessons`;
  return JSON.parse(localStorage.getItem(learningKey) || '[]');
}

function isLessonCompleted(lesson: Lesson, courseId: string, completedTasks: string[], completedLessons: string[]): boolean {
  // Check if learning is completed
  const learningComplete = completedLessons.includes(lesson.id);
  
  // Check if all tasks are completed
  const tasksComplete = lesson.tasks.length > 0 && 
    lesson.tasks.every(task => completedTasks.includes(task.id));
  
  // Check learning done status
  const learningDoneKey = `lesson_${lesson.id}_learningDone`;
  const learningDone = localStorage.getItem(learningDoneKey) === 'true';
  
  // For mixed lessons (both learning and tasks), complete if either is done
  // For task-only lessons, complete only if tasks are done
  // For learning-only lessons, complete only if learning is done
  if (lesson.tasks.length > 0 && learningDone) {
    return learningComplete || tasksComplete;
  } else if (lesson.tasks.length > 0) {
    return tasksComplete;
  } else {
    return learningComplete || learningDone;
  }
}

function isQuizPassed(lessonId: string): boolean {
  const quizPassedKey = `lesson_${lessonId}_quizPassed`;
  return localStorage.getItem(quizPassedKey) === 'true';
}

/**
 * Listen for progress updates and add timestamped activities
 */
export function addTimestampedActivity(activity: Omit<ActivityItem, 'timestamp'>): void {
  const timestampedActivity: ActivityItem = {
    ...activity,
    timestamp: new Date()
  };
  
  // Store in session for current session tracking
  const sessionKey = 'dashboard_session_activities';
  const sessionActivities = JSON.parse(sessionStorage.getItem(sessionKey) || '[]');
  sessionActivities.unshift(timestampedActivity);
  
  // Keep only recent 20 session activities
  if (sessionActivities.length > 20) {
    sessionActivities.splice(20);
  }
  
  sessionStorage.setItem(sessionKey, JSON.stringify(sessionActivities));
  
  // Dispatch event for real-time dashboard updates
  window.dispatchEvent(new CustomEvent('dashboard:activity', { detail: timestampedActivity }));
}

/**
 * Get timestamped activities from current session
 */
export function getSessionActivities(): ActivityItem[] {
  const sessionKey = 'dashboard_session_activities';
  return JSON.parse(sessionStorage.getItem(sessionKey) || '[]');
}