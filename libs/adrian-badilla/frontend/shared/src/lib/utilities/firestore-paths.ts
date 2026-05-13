export const userPaths = {
  root: (uid: string) =>
    `users/${uid}`,

  diets: (uid: string) =>
    `users/${uid}/diets`,

  diet: (uid: string, dietId: string) =>
    `users/${uid}/diets/${dietId}`,

  meals: (uid: string, dietId: string) =>
    `users/${uid}/diets/${dietId}/meals`,

  routines: (uid: string) =>
    `users/${uid}/routines`,

  routine: (uid: string, routineId: string) =>
    `users/${uid}/routines/${routineId}`,

  /** Subcollection name matches the Firestore typo "exercices" intentionally. */
  exercises: (uid: string, routineId: string) =>
    `users/${uid}/routines/${routineId}/exercices`,

  dailyStatus: (uid: string) =>
    `users/${uid}/daily-status`,

  // Specific daily entry: users/{uid}/daily-status/2026-05-11
  dailyStatusEntry: (uid: string, date: string) =>
    `users/${uid}/daily-status/${date}`,
};