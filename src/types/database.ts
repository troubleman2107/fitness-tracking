import { ExerciseStatus, MuscleGroup, SetStatus } from "./database.types";

export interface DbTemplate {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface DbSession {
  id: string;
  template_id: string;
  name: string;
  date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbExercise {
  id: string;
  session_id: string;
  name: string;
  muscle_group: MuscleGroup;
  status: ExerciseStatus;
  created_at: string;
  updated_at: string;
}

export interface DbSet {
  id: string;
  exercise_id: string;
  reps: number | null;
  weight: number | null;
  rest_time: number | null;
  status: SetStatus;
  created_at: string;
  updated_at: string;
  setOrder?: string;
}
