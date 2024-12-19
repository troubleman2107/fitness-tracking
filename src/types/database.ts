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
}

export interface DbExercise {
  id: string;
  session_id: string;
  name: string;
}

export interface DbSet {
  id: string;
  exercise_id: string;
  weight: number;
  reps: number;
  rest_time: number;
}
