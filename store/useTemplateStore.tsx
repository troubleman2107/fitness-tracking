import { create } from "zustand";
import { Template, SessionData, Exercise, Set } from "@/types/session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadData, saveData } from "@/utils/AsyncStorage";

interface StoreState {
  templates: Template[];
  sessions: SessionData[];
  exercises: Exercise[];
  sets: Set[];
  templateSelect: Template | null;

  loadData: () => Promise<void>;
  updateEntity: <T>(key: keyof StoreState, data: T[]) => Promise<void>;

  addTemplate: (template: Template) => void;
  saveTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  addSession: (session: SessionData) => void;
  addExercise: (exercise: Exercise) => void;
  addSet: (set: Set) => void;
  updateSetInTemplate: (setData: Set) => void;
  progressToNextSet: (exercises: Exercise[]) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  templates: [],
  sessions: [],
  exercises: [],
  sets: [],
  templateSelect: null,
  // Load all data from AsyncStorage
  loadData: async () => {
    const templates = await loadData<Template[]>("templates");
    const sessions = await loadData<SessionData[]>("sessions");
    const exercises = await loadData<Exercise[]>("exercises");
    const sets = await loadData<Set[]>("sets");

    set({
      templates: templates || [],
      sessions: sessions || [],
      exercises: exercises || [],
      sets: sets || [],
    });
  },

  // Update a specific entity and save it to AsyncStorage
  updateEntity: async <T,>(key: keyof StoreState, data: T[]) => {
    set({ [key]: data } as Partial<StoreState>);
    await saveData(key, data);
  },

  // Actions
  addTemplate: (template) => {
    const templates = get().templates;
    const updatedTemplates = [...templates, template];
    set({ templates: updatedTemplates });
    saveData("templates", updatedTemplates);
  },

  deleteTemplate: (id) => {
    const templates = get().templates.filter((template) => template.id !== id);
    set({ templates });
    saveData("templates", templates);
  },

  saveTemplate: (template: Template) => {
    const templates = get().templates;
    const updatedTemplates = templates.map((t) => {
      if (t.id === template.id) {
        return template;
      }
      return t;
    });
    set({ templates: updatedTemplates });
    saveData("templates", updatedTemplates);
  },

  addSession: (session) => {
    const sessions = get().sessions;
    const updatedSessions = [...sessions, session];
    set({ sessions: updatedSessions });
    saveData("sessions", updatedSessions);
  },

  addExercise: (exercise) => {
    const exercises = get().exercises;
    const updatedExercises = [...exercises, exercise];
    set({ exercises: updatedExercises });
    saveData("exercises", updatedExercises);
  },

  addSet: (fSet) => {
    const sets = get().sets;
    const updatedSets = [...sets, fSet];
    set({ sets: updatedSets });
    saveData("sets", updatedSets);
  },

  updateSetInTemplate: (setData: Set) => {
    const templateSelect = get().templateSelect;
    const getTemplates = get().templates;
    if (!templateSelect || !getTemplates) return;

    const updatedTemplatesSelect = {
      ...templateSelect,
      sessions: templateSelect.sessions.map((session) => ({
        ...session,
        exercises: session.exercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((set) =>
            set.id === setData.id ? { ...set, ...setData } : set
          ),
        })),
      })),
    };

    const updatedTemplates = getTemplates.map((t) => {
      if (t.id === templateSelect.id) {
        return updatedTemplatesSelect;
      }
      return t;
    });

    set({ templateSelect: updatedTemplatesSelect });
    set({ templates: updatedTemplates });
    saveData("templates", updatedTemplates);
  },

  progressToNextSet: (exercises: Exercise[]) => {
    const templateSelect = get().templateSelect;
    if (!templateSelect) return;

    const updatedTemplateSelect = {
      ...templateSelect,
      sessions: templateSelect.sessions.map((session) => ({
        ...session,
        exercises: session.exercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((set) => ({ ...set, active: false })),
        })),
      })),
    };
  },
}));
