import { supabase } from "../supabaseClient";
import { Exercise, SessionData, Set, Template } from "@/types/session";
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

  async deleteTemplate(id: string) {
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) throw error;
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
      rest_time: set.rest_time,
      setOrder: set.setOrder,
    }));

    const { error } = await supabase.from("sets").insert(setsToInsert);

    if (error) throw new Error(`Failed to create sets: ${error.message}`);
  }

  async saveSet(exerciseId: string, set: Set, userId: string): Promise<DbSet> {
    const { data, error } = await supabase
      .from("sets")
      .update({
        weight: set.weight,
        reps: set.reps,
        rest_time: set.rest_time,
      })
      .eq("id", set.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to save set: ${error.message}`);
    return data;
  }

  async saveFullTemplate(
    templateData: Template,
    userId: string
  ): Promise<void> {
    console.log("🚀 ~ TemplateService ~ templateData:", templateData);
    try {
      const dbTemplate = await this.createTemplate(templateData.name, userId);

      const dbSessions = await this.createSessions(
        templateData.sessions,
        dbTemplate.id,
        userId
      );

      await Promise.all(
        dbSessions.map(async (dbSession, sessionIndex) => {
          // Match session by index instead of name
          // const sessionData = templateData.sessions[sessionIndex];

          const sessionData = templateData.sessions.find(
            (session) => session.date === dbSession.date
          );

          if (!sessionData?.exercises) {
            throw new Error(
              `No exercises found for session: ${dbSession.name}`
            );
          }

          const dbExercises = await this.createExercises(
            sessionData.exercises,
            dbSession.id,
            userId
          );

          await Promise.all(
            dbExercises.map(async (dbExercise, exerciseIndex) => {
              // Match exercise by index instead of name
              const exerciseData = sessionData.exercises[exerciseIndex];

              if (!exerciseData?.sets) {
                throw new Error(
                  `No sets found for exercise: ${dbExercise.name}`
                );
              }

              await this.createSets(exerciseData.sets, dbExercise.id, userId);
            })
          );
        })
      );
    } catch (error) {
      const errorMessage = (error as any).message;
      throw new Error(`Failed to save template: ${errorMessage}`);
    }
  }
}

export const templateService = new TemplateService();
