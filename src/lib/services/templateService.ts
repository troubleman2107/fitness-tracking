import { supabase } from "../supabaseClient";
import { Exercise, SessionData, Set, Template } from "@/types/session";
import { DbTemplate, DbSession, DbExercise, DbSet } from "@/src/types/database";

class TemplateService {
  async getTemplates() {
    const { data, error } = await supabase
      .from("templates")
      .select(
        `
        *,
        sessions:sessions(
          *,
          exercises:exercises(
            *,
            sets:sets(*)
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as DbTemplate[];
  }

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

  async createFullTemplate(
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

  async updateTemplate(id: string, name: string): Promise<DbTemplate> {
    const { data, error } = await supabase
      .from("templates")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update template: ${error.message}`);
    return data;
  }

  async deleteSessionsByTemplateId(templateId: string): Promise<void> {
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("template_id", templateId);

    if (error) throw new Error(`Failed to delete sessions: ${error.message}`);
  }

  async updateSession(session: SessionData): Promise<DbSession> {
    const { data, error } = await supabase
      .from("sessions")
      .update({
        name: session.name,
        date: session.date,
      })
      .eq("id", session.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update session: ${error.message}`);
    return data;
  }

  async updateExercise(exercise: Exercise): Promise<DbExercise> {
    const { data, error } = await supabase
      .from("exercises")
      .update({
        name: exercise.name,
      })
      .eq("id", exercise.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update exercise: ${error.message}`);
    return data;
  }

  async updateSet(set: Set): Promise<DbSet> {
    const { data, error } = await supabase
      .from("sets")
      .update({
        weight: set.weight,
        reps: set.reps,
        rest_time: set.rest_time,
        setOrder: set.setOrder,
      })
      .eq("id", set.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update set: ${error.message}`);
    return data;
  }

  async updateFullTemplate(
    templateId: string,
    templateData: Template,
    userId: string
  ): Promise<void> {
    try {
      // Update template name if changed
      await this.updateTemplate(templateId, templateData.name);

      // Update existing sessions
      await Promise.all(
        templateData.sessions.map(async (session) => {
          if (session.id) {
            // Update existing session
            await this.updateSession(session);

            // Update exercises
            await Promise.all(
              session.exercises?.map(async (exercise) => {
                if (exercise.id) {
                  // Update existing exercise
                  await this.updateExercise(exercise);

                  // Update sets
                  await Promise.all(
                    exercise.sets?.map(async (set) => {
                      if (set.id) {
                        await this.updateSet(set);
                      } else {
                        // Create new set if it doesn't exist
                        await this.createSets([set], exercise.id, userId);
                      }
                    }) || []
                  );
                } else {
                  // Create new exercise if it doesn't exist
                  if (!session.id) {
                    throw new Error(
                      `Session ID is undefined for session: ${session.name}`
                    );
                  }
                  const dbExercise = await this.createExercises(
                    [exercise],
                    session.id,
                    userId
                  );
                  if (exercise.sets) {
                    await this.createSets(
                      exercise.sets,
                      dbExercise[0].id,
                      userId
                    );
                  }
                }
              }) || []
            );
          } else {
            // Create new session if it doesn't exist
            const dbSession = await this.createSessions(
              [session],
              templateId,
              userId
            );

            if (session.exercises) {
              const dbExercises = await this.createExercises(
                session.exercises,
                dbSession[0].id,
                userId
              );

              await Promise.all(
                dbExercises.map(async (dbExercise, index) => {
                  const exerciseData = session.exercises![index];
                  if (exerciseData.sets) {
                    await this.createSets(
                      exerciseData.sets,
                      dbExercise.id,
                      userId
                    );
                  }
                })
              );
            }
          }
        })
      );
    } catch (error) {
      const errorMessage = (error as any).message;
      throw new Error(`Failed to update template: ${errorMessage}`);
    }
  }
}

export const templateService = new TemplateService();
