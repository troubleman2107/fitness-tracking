import { SessionData, Set } from "@/types/session";
import { create } from "zustand";

export interface InitialState {
  sessionData: SessionData | null;
  currentSet: Set;
  isRest: boolean;
  allSessionData: SessionData[] | null;
  toggleRest?: () => void;
  doneSet?: (currentSet: Set) => void;
}

export const useSessionStore = create<InitialState>((set) => ({
  isRest: false,
  sessionData: null,
  allSessionData: null,
  currentSet: {
    reps: null,
    weight: null,
    id: "",
    active: false,
    restTime: null,
  },
  toggleRest: () => set((state) => ({ isRest: !state.isRest })),
  doneSet: (currentSet) =>
    set((state) => {
      if (!state?.sessionData) {
        return state;
      } else {
        return {
          ...state,
          sessionData: {
            ...state.sessionData,
            exercises: state.sessionData.exercises.map((exercise) => {
              if (exercise.sets.filter((item) => item.active)) {
                return {
                  ...exercise,
                  sets: exercise.sets.map((set) => {
                    if (set.active) {
                      return {
                        ...set,
                        weight: Number(currentSet.weight),
                        reps: Number(currentSet.reps),
                        status:
                          Number(currentSet.weight) * Number(currentSet.reps) >
                          Number(set?.weight) * Number(set?.reps)
                            ? "goal"
                            : "down",
                      };
                    }
                    return set;
                  }),
                };
              }
              return exercise;
            }),
          },
        };
      }
    }),
}));
