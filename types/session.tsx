export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: Set[];
}
export interface Set {
  id: string;
  reps: number | null;
  weight?: number | null;
  restTime?: number | null;
  active?: boolean;
  status?: string;
  isDone?: boolean;
}
export interface SessionData {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
}