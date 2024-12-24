export interface Template {
  id: string;
  name: string;
  sessions: SessionData[];
  created_at: string;
}

export interface SessionData {
  id?: string;
  date: string;
  name: string;
  exercises: Exercise[];
  isDone?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group?: string;
  sets: Set[];
  status?: string;
  created_at: string;
  updated_at: string;
}

// export interface DbExercise {
//   id: string;
//   session_id: string;
//   name: string;
//   muscle_group: MuscleGroup;
//   status: ExerciseStatus;
//   created_at: string;
//   updated_at: string;
// }

export interface Set {
  id: string;
  setOrder?: string;
  reps: number | null;
  weight?: number | null;
  rest_time?: number | null;
  active?: boolean;
  status?: string;
  isDone?: boolean;
}
