export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          status: UserStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<User, "created_at" | "updated_at">;
        Update: Partial<User>;
      };
      templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Template, "id" | "created_at" | "updated_at">;
        Update: Partial<Template>;
      };
      sessions: {
        Row: {
          id: string;
          template_id: string;
          name: string;
          date: string;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Session, "id" | "created_at" | "updated_at">;
        Update: Partial<Session>;
      };
      exercises: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          muscle_group: MuscleGroup;
          status: ExerciseStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Exercise, "id" | "created_at" | "updated_at">;
        Update: Partial<Exercise>;
      };
      sets: {
        Row: {
          id: string;
          exercise_id: string;
          reps: number | null;
          weight: number | null;
          rest_time: number | null;
          status: SetStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Set, "id" | "created_at" | "updated_at">;
        Update: Partial<Set>;
      };
    };
    Enums: {
      user_status: UserStatus;
      exercise_status: ExerciseStatus;
      set_status: SetStatus;
      muscle_group_type: MuscleGroup;
    };
  };
};

// Enum Types
export type UserStatus = "active" | "inactive" | "banned";
export type ExerciseStatus = "pending" | "completed" | "skipped";
export type SetStatus = "pending" | "completed" | "failed";
export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "abs"
  | "cardio"
  | "other";

// Simplified Types for use in components
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  sessions?: Session[];
}

export interface Session {
  id: string;
  template_id: string;
  name: string;
  date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  exercises?: Exercise[];
}

export interface Exercise {
  id: string;
  session_id: string;
  name: string;
  muscle_group: MuscleGroup;
  status: ExerciseStatus;
  created_at: string;
  updated_at: string;
  sets?: Set[];
}

export interface Set {
  id: string;
  exercise_id: string;
  reps: number | null;
  weight: number | null;
  rest_time: number | null;
  status: SetStatus;
  created_at: string;
  updated_at: string;
}

// Helper type for new records
export type NewTemplate = Omit<Template, "id" | "created_at" | "updated_at">;
export type NewSession = Omit<Session, "id" | "created_at" | "updated_at">;
export type NewExercise = Omit<Exercise, "id" | "created_at" | "updated_at">;
export type NewSet = Omit<Set, "id" | "created_at" | "updated_at">;
