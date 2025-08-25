// src/lib/progress-sync.ts
import { getAuth } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firestore"; // ⬅️ adjust import to your firebase init

type BaseCtx = {
  courseId: string;
  chapterId: string;
  lessonId: string;
};

export async function syncLearningDone(ctx: BaseCtx) {
  const uid = getAuth().currentUser?.uid;
  if (!uid) return; // not logged in → skip DB write, keep localStorage as-is

  const { courseId, chapterId, lessonId } = ctx;
  const ref = doc(db, "users", uid, "progress", lessonId);

  // NOTE: we do NOT set `completed` here to avoid implying full completion before quiz.
  await setDoc(
    ref,
    {
      courseId,
      chapterId,
      lessonId,
      learningDone: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function syncQuizResult(
  ctx: BaseCtx & { score: number; passed: boolean }
) {
  const uid = getAuth().currentUser?.uid;
  if (!uid) return;

  const { courseId, chapterId, lessonId, score, passed } = ctx;
  const ref = doc(db, "users", uid, "progress", lessonId);

  // Here we mark the lesson fully completed and store score & pass flag.
  await setDoc(
    ref,
    {
      courseId,
      chapterId,
      lessonId,
      completed: true,
      score: Math.round(score),
      passed,
      timestamp: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
