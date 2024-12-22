import { create } from "zustand";
import { Database } from "../src/types/database.types";
import { supabaseService } from "@/src/services/supabaseService";
import { DbExercise, DbSession, DbSet, DbTemplate } from "@/src/types/database";

type Template = DbTemplate & {
  sessions?: (DbSession & {
    exercises?: (DbExercise & {
      sets?: DbSet[];
    })[];
  })[];
};

interface StoreState {
  templates: Template[];
  loading: boolean;
  error: string | null;

  fetchTemplates: () => Promise<void>;
  addTemplate: (
    template: Database["public"]["Tables"]["templates"]["Insert"]
  ) => Promise<Template | undefined>;
  updateTemplate: (
    id: string,
    template: Database["public"]["Tables"]["templates"]["Update"]
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  templates: [],
  loading: false,
  error: null,

  fetchTemplates: async () => {
    set({ loading: true });
    try {
      const templates = await supabaseService.getTemplates();
      set({ templates, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addTemplate: async (template) => {
    try {
      const newTemplate = await supabaseService.createTemplate(template);
      set((state) => ({
        templates: [...state.templates, newTemplate],
        error: null,
      }));
      return newTemplate;
    } catch (error) {
      set({ error: (error as Error).message });
      return undefined;
    }
  },

  updateTemplate: async (id, template) => {
    try {
      const updatedTemplate = await supabaseService.updateTemplate(
        id,
        template
      );
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === id ? updatedTemplate : t
        ),
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteTemplate: async (id) => {
    try {
      await supabaseService.deleteTemplate(id);
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
