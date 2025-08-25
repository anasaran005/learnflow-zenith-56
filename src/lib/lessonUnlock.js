class LessonUnlockSystem {
  constructor(userStartDate) {
    // Set the global start date to September 1, 2025
    this.globalStartDate = new Date('2025-09-01');
    
    // User start date cannot be before the global start date
    this.userStartDate = new Date(userStartDate);
    if (this.userStartDate < this.globalStartDate) {
      this.userStartDate = new Date(this.globalStartDate);
    }
    
    // Ensure user start date is a weekday
    this.userStartDate = this.adjustToNextWeekday(this.userStartDate);
    
    this.unlockSchedule = this.generateUnlockSchedule();
  }

  // Adjust date to next weekday if it falls on weekend
  adjustToNextWeekday(date) {
    const adjustedDate = new Date(date);
    while (adjustedDate.getDay() === 0 || adjustedDate.getDay() === 6) {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
    }
    return adjustedDate;
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
        // First lesson unlocked on user start date (already adjusted to weekday)
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

    // Check if current date is before global start date
    const globalStart = new Date(this.globalStartDate);
    globalStart.setHours(0, 0, 0, 0);
    if (today < globalStart) return false;

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

    // Check if current date is before global start date
    const globalStart = new Date(this.globalStartDate);
    globalStart.setHours(0, 0, 0, 0);
    if (today < globalStart) {
      const diffTime = globalStart - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

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

  // Get the global start date
  getGlobalStartDate() {
    return new Date(this.globalStartDate);
  }

  // Get the user's adjusted start date
  getUserStartDate() {
    return new Date(this.userStartDate);
  }

  getAllLessonIds() {
    return Object.keys(this.unlockSchedule);
  }

  getCompleteSchedule() {
    return this.unlockSchedule;
  }

  // Helper method to check if system is active
  isSystemActive(currentDate = new Date()) {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    
    const globalStart = new Date(this.globalStartDate);
    globalStart.setHours(0, 0, 0, 0);
    
    return today >= globalStart;
  }
}

/*
⚡ How to use
- System starts on September 1, 2025
- On first login, save userStartDate in DB = new Date()
- Pass that when creating the instance
- If user registers before Sep 1, 2025, their lessons will start on Sep 1
- Nothing unlocks on weekends (Sat/Sun)
*/

// Example: user registration date (could be before Sep 1, 2025)
const userRegistrationDate = new Date(); 
export const lessonUnlockSystem = new LessonUnlockSystem(userRegistrationDate);

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

export const getGlobalStartDate = () => lessonUnlockSystem.getGlobalStartDate();

export const getUserStartDate = () => lessonUnlockSystem.getUserStartDate();

export const isSystemActive = (currentDate) => lessonUnlockSystem.isSystemActive(currentDate);

// Example usage:
console.log('Global start date:', lessonUnlockSystem.getGlobalStartDate());
console.log('User start date:', lessonUnlockSystem.getUserStartDate());
console.log('Is system active?', lessonUnlockSystem.isSystemActive());
console.log('First lesson unlock date:', lessonUnlockSystem.getLessonUnlockDate('les_1_1'));