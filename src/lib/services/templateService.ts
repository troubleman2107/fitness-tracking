import { supabase } from "../supabaseClient";
import { Exercise, SessionData, Set } from "@/types/session";
import { DbTemplate, DbSession, DbExercise, DbSet } from "@/src/types/database";

class TemplateService {
  async createTemplate(name: string, userId: string): Promise<DbTemplate> {
    const { data, error } = await supabase
      .from("templates")
      .insert({
        name,
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create template: ${error.message}`);
    return data;
  }

  async createSessions(
    sessions: SessionData[],
    templateId: string,
    userId: string
  ): Promise<DbSession[]> {
    const sessionsToInsert = sessions.map((session) => ({
      template_id: templateId,
      name: session.name,
      date: session.date,
    }));

    const { data, error } = await supabase
      .from("sessions")
      .insert(sessionsToInsert)
      .select();

    if (error) throw new Error(`Failed to create sessions: ${error.message}`);
    return data;
  }

  async createExercises(
    exercises: Exercise[],
    sessionId: string,
    userId: string
  ): Promise<DbExercise[]> {
    const exercisesToInsert = exercises.map((exercise) => ({
      session_id: sessionId,
      name: exercise.name,
    }));

    const { data, error } = await supabase
      .from("exercises")
      .insert(exercisesToInsert)
      .select();

    if (error) throw new Error(`Failed to create exercises: ${error.message}`);
    return data;
  }

  async createSets(
    sets: Set[],
    exerciseId: string,
    userId: string
  ): Promise<void> {
    const setsToInsert = sets.map((set) => ({
      exercise_id: exerciseId,
      weight: set.weight,
      reps: set.reps,
      rest_time: set.restTime,
    }));

    const { error } = await supabase.from("sets").insert(setsToInsert);

    if (error) throw new Error(`Failed to create sets: ${error.message}`);
  }

  async saveSet(exerciseId: string, set: Set, userId: string): Promise<DbSet> {
    const { data, error } = await supabase
      .from("sets")
      .update({
        id: set.id,
        exercise_id: exerciseId,
        weight: set.weight,
        reps: set.reps,
        rest_time: set.restTime,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save set: ${error.message}`);
    return data;
  }

  async saveFullTemplate(
    templateName: string,
    userId: string,
    sessions: SessionData[],
    exercises: Exercise[]
  ): Promise<void> {
    // Create template
    const template = await this.createTemplate(templateName, userId);

    // Create sessions
    const dbSessions = await this.createSessions(sessions, template.id, userId);

    // Create exercises and sets for each session
    await Promise.all(
      dbSessions.map(async (session) => {
        const sessionExercises = await this.createExercises(
          exercises,
          session.id,
          userId
        );

        // Create sets for each exercise
        await Promise.all(
          sessionExercises.map(async (exercise) => {
            const exerciseData = exercises.find(
              (e) => e.name === exercise.name
            );
            if (exerciseData?.sets) {
              await this.createSets(exerciseData.sets, exercise.id, userId);
            }
          })
        );
      })
    );
  }
}

export const templateService = new TemplateService();
