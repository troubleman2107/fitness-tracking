import { create } from "zustand";
import { Template, SessionData, Exercise, Set } from "@/types/session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadData, saveData } from "@/utils/AsyncStorage";

interface StoreState {
  templates: Template[];
  sessions: SessionData[];
  exercises: Exercise[];
  sets: Set[];

  loadData: () => Promise<void>;
  updateEntity: <T>(key: keyof StoreState, data: T[]) => Promise<void>;

  addTemplate: (template: Template) => void;
  addSession: (session: SessionData) => void;
  addExercise: (exercise: Exercise) => void;
  addSet: (set: Set) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  templates: [],
  sessions: [],
  exercises: [],
  sets: [],

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
}));
