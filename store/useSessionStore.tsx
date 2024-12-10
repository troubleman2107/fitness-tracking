import { SessionData, Set } from "@/types/session";
import { create } from "zustand";

export interface InitialState {
  sessionData: SessionData | null;
  currentSet: Set;
  isRest: boolean;
  toggleRest?: () => void;
}

export const useSessionStore = create<InitialState>((set) => ({
  isRest: false,
  sessionData: null,
  currentSet: {
    reps: null,
    weight: null,
    id: "",
    active: false,
    restTime: null,
  },
  toggleRest: () => set((state) => ({ isRest: !state.isRest })),
}));
