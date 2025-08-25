class LessonUnlockSystem {
  constructor(userStartDate) {
    // First login date of the user
    this.userStartDate = new Date(userStartDate);
    this.unlockSchedule = this.generateUnlockSchedule();
  }

  // Generate lesson IDs matching CSV format
  generateLessonIds() {
    const lessons = [];
    let lessonIndex = 0;

    // Chapter 1: 9 lessons
    for (let i = 1; i <= 9; i++) {
      lessons.push({
        id: `les_1_${i}`,
        chapterNumber: 1,
        lessonNumber: i,
        globalIndex: lessonIndex++
      });
    }

    // Chapters 2–12: 10 lessons each (chapter 5 has 11)
    for (let chapter = 2; chapter <= 12; chapter++) {
      const lessonsInChapter = chapter === 5 ? 11 : 10;

      for (let lesson = 1; lesson <= lessonsInChapter; lesson++) {
        lessons.push({
          id: `les_${chapter}_${lesson}`,
          chapterNumber: chapter,
          lessonNumber: lesson,
          globalIndex: lessonIndex++
        });
      }
    }

    return lessons;
  }

  // Generate unlock schedule for this user
  generateUnlockSchedule() {
    const schedule = {};
    const lessons = this.generateLessonIds();
    let currentDate = new Date(this.userStartDate);

    lessons.forEach((lesson, index) => {
      if (index === 0) {
        // First lesson unlocked immediately
        schedule[lesson.id] = {
          ...lesson,
          unlockDate: new Date(this.userStartDate),
          isFirstLesson: true
        };
      } else {
        // Go to next weekday (skip Sat/Sun)
        do {
          currentDate.setDate(currentDate.getDate() + 1);
        } while (currentDate.getDay() === 0 || currentDate.getDay() === 6);

        schedule[lesson.id] = {
          ...lesson,
          unlockDate: new Date(currentDate),
          isFirstLesson: false
        };
      }
    });

    return schedule;
  }

  // Check if a lesson is unlocked for this user
  isLessonUnlockedById(lessonId, currentDate = new Date()) {
    const lesson = this.unlockSchedule[lessonId];
    if (!lesson) return true;

    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    const unlockDate = new Date(lesson.unlockDate);
    unlockDate.setHours(0, 0, 0, 0);

    return today >= unlockDate;
  }

  // Get unlock date of a lesson
  getLessonUnlockDate(lessonId) {
    const lesson = this.unlockSchedule[lessonId];
    return lesson ? lesson.unlockDate : null;
  }

  // Days until unlock
  getDaysUntilUnlock(lessonId, currentDate = new Date()) {
    const unlockDate = this.getLessonUnlockDate(lessonId);
    if (!unlockDate) return 0;

    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    const unlock = new Date(unlockDate);
    unlock.setHours(0, 0, 0, 0);

    const diffTime = unlock - today;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Chapter unlocked if at least one lesson in it is unlocked
  isChapterUnlocked(chapterNumber, lessons, currentDate = new Date()) {
    return lessons.some(lesson =>
      this.isLessonUnlockedById(lesson.id, currentDate)
    );
  }

  getAllLessonIds() {
    return Object.keys(this.unlockSchedule);
  }

  getCompleteSchedule() {
    return this.unlockSchedule;
  }
}

/*
⚡ How to use
- On first login, save userStartDate in DB = new Date()
- Pass that when creating the instance
*/

// Example: first login today
const firstLoginDate = new Date(); 
export const lessonUnlockSystem = new LessonUnlockSystem(firstLoginDate);

// Helper functions
export const isLessonUnlocked = (lessonId, currentDate) =>
  lessonUnlockSystem.isLessonUnlockedById(lessonId, currentDate);

export const getLessonUnlockDate = (lessonId) =>
  lessonUnlockSystem.getLessonUnlockDate(lessonId);

export const getDaysUntilUnlock = (lessonId, currentDate) =>
  lessonUnlockSystem.getDaysUntilUnlock(lessonId, currentDate);

export const isChapterUnlocked = (chapterNumber, lessons, currentDate) =>
  lessonUnlockSystem.isChapterUnlocked(chapterNumber, lessons, currentDate);

export const getAllLessonIds = () => lessonUnlockSystem.getAllLessonIds();
export const getCompleteSchedule = () => lessonUnlockSystem.getCompleteSchedule();

