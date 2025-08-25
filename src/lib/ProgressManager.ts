/**
 * ProgressManager - Google Sheets progress tracking via backend API
 * Manages all progress operations for the Firebase auth + Google Sheets LMS
 */

export type ProgressType =
  | 'completed_tasks'
  | 'completed_lessons'
  | 'watched_topics'
  | 'quiz_score'
  | 'quiz_passed'
  | 'learning_done';

export interface ProgressRow {
  user_id: string;
  course_id: string;
  lesson_id: string;
  task_id: string;
  progress_type: ProgressType;
  progress_value: any;
  updated_at: string;
  source?: string;
}

export interface SaveProgressParams {
  userId: string;
  courseId: string;
  lessonId?: string;
  taskId?: string;
  type: ProgressType;
  value: any;
}

export const ProgressManager = {
  /**
   * Save a single progress event to Google Sheets via backend API
   */
  async saveProgress({ userId, courseId, lessonId = '', taskId = '', type, value }: SaveProgressParams): Promise<void> {
    try {
      const response = await fetch('/api/progress/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          task_id: taskId,
          progress_type: type,
          progress_value: value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`API Error: ${errorData.error || 'Failed to save progress'}`);
      }

      const result = await response.json();
      if (!result.ok) {
        throw new Error('Progress save failed');
      }

      console.log(`✅ Progress saved: ${type} for user ${userId}`);
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
      throw error;
    }
  },

  /**
   * Read all progress for a user, optionally filtered by course
   */
  async getAllProgress(userId: string, courseId?: string): Promise<ProgressRow[]> {
    try {
      const url = new URL('/api/progress/read', window.location.origin);
      url.searchParams.set('user_id', userId);
      if (courseId) {
        url.searchParams.set('course_id', courseId);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`API Error: ${errorData.error || 'Failed to read progress'}`);
      }

      const result = await response.json();
      return result.rows || [];
    } catch (error) {
      console.error('❌ Failed to read progress:', error);
      throw error;
    }
  },

  /**
   * Get the latest value for a specific progress type and key combination
   */
  getLatestBy({ 
    rows, 
    type, 
    lessonId = '', 
    taskId = '' 
  }: { 
    rows: ProgressRow[]; 
    type: ProgressType; 
    lessonId?: string; 
    taskId?: string; 
  }): any {
    const filtered = rows
      .filter(row => 
        row.progress_type === type &&
        row.lesson_id === lessonId &&
        row.task_id === taskId
      )
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return filtered.length > 0 ? filtered[0].progress_value : null;
  }
};

/**
 * Helper functions to extract specific progress data from rows
 */

export function deriveCompletedTaskIds(rows: ProgressRow[], courseId: string): string[] {
  const completedTasks = rows
    .filter(row => 
      row.progress_type === 'completed_tasks' && 
      row.course_id === courseId &&
      row.progress_value === true
    )
    .map(row => row.task_id)
    .filter(Boolean);
  
  return [...new Set(completedTasks)]; // Remove duplicates
}

export function deriveCompletedLessonIds(rows: ProgressRow[], courseId: string): string[] {
  const completedLessons = rows
    .filter(row => 
      row.progress_type === 'completed_lessons' && 
      row.course_id === courseId &&
      row.progress_value === true
    )
    .map(row => row.lesson_id)
    .filter(Boolean);
  
  return [...new Set(completedLessons)]; // Remove duplicates
}

export function getWatchedTopicsForLesson(rows: ProgressRow[], lessonId: string): string[] {
  const latest = ProgressManager.getLatestBy({ rows, type: 'watched_topics', lessonId });
  return Array.isArray(latest) ? latest : [];
}

export function getQuizScoreForLesson(rows: ProgressRow[], lessonId: string): number | null {
  const latest = ProgressManager.getLatestBy({ rows, type: 'quiz_score', lessonId });
  return typeof latest === 'number' ? latest : null;
}

export function isQuizPassedForLesson(rows: ProgressRow[], lessonId: string): boolean {
  const latest = ProgressManager.getLatestBy({ rows, type: 'quiz_passed', lessonId });
  return latest === true;
}

export function isLearningDoneForLesson(rows: ProgressRow[], lessonId: string): boolean {
  const latest = ProgressManager.getLatestBy({ rows, type: 'learning_done', lessonId });
  return latest === true;
}