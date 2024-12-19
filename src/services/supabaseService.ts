import { supabase } from "@/src/lib/supabaseClient";
import { Database } from "../types/database.types";

type Tables = Database["public"]["Tables"];
type Template = Tables["templates"]["Row"] & {
  sessions?: (Tables["sessions"]["Row"] & {
    exercises?: (Tables["exercises"]["Row"] & {
      sets?: Tables["sets"]["Row"][];
    })[];
  })[];
};

export const supabaseService = {
  // Template operations
  async createTemplate(template: Tables["templates"]["Insert"]) {
    const { data, error } = await supabase
      .from("templates")
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data as Template;
  },

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
    return data as Template[];
  },

  async updateTemplate(id: string, template: Tables["templates"]["Update"]) {
    const { data, error } = await supabase
      .from("templates")
      .update(template)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Template;
  },

  async deleteTemplate(id: string) {
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) throw error;
  },

  // Session operations
  async createSession(session: Tables["sessions"]["Insert"]) {
    const { data, error } = await supabase
      .from("sessions")
      .insert([session])
      .select()
      .single();

    if (error) throw error;
    return data as Tables["sessions"]["Row"];
  },

  async updateSession(id: string, session: Tables["sessions"]["Update"]) {
    const { data, error } = await supabase
      .from("sessions")
      .update(session)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Tables["sessions"]["Row"];
  },

  // Exercise operations
  async createExercise(exercise: Tables["exercises"]["Insert"]) {
    const { data, error } = await supabase
      .from("exercises")
      .insert([exercise])
      .select()
      .single();

    if (error) throw error;
    return data as Tables["exercises"]["Row"];
  },

  async updateExercise(id: string, exercise: Tables["exercises"]["Update"]) {
    const { data, error } = await supabase
      .from("exercises")
      .update(exercise)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Tables["exercises"]["Row"];
  },

  // Set operations
  async createSet(set: Tables["sets"]["Insert"]) {
    const { data, error } = await supabase
      .from("sets")
      .insert([set])
      .select()
      .single();

    if (error) throw error;
    return data as Tables["sets"]["Row"];
  },

  async updateSet(id: string, set: Tables["sets"]["Update"]) {
    const { data, error } = await supabase
      .from("sets")
      .update(set)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Tables["sets"]["Row"];
  },
};
