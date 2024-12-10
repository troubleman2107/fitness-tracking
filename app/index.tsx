import { SafeAreaView, Text, View } from "react-native";
import React, { useEffect, useReducer, useState } from "react";
import { StatusBar } from "expo-status-bar";
import Exercise from "@/components/Exercise";
import ModalSetOfRep from "@/components/ModalSetOfRep";
import CountDownRest from "@/components/CountDownRest";
import { setItem, getItem } from "@/utils/AsyncStorage";
import { SessionData, Set } from "@/types/session";
import {
  Calendar,
  CalendarList,
  Agenda,
  WeekCalendar,
  CalendarProvider,
  ExpandableCalendar,
  DateData,
} from "react-native-calendars";

import { useSessionStore } from "@/store/useSessionStore";

const data = require("@/data/data.json");

setItem("sessionData", data);

export interface InitialState {
  allSessionData: SessionData[] | null;
  sessionData: SessionData | null;
  currentSet: Set;
}

const initialState: InitialState = {
  allSessionData: null,
  sessionData: null,
  currentSet: {
    reps: null,
    weight: null,
    id: "",
    active: false,
    restTime: null,
  },
};

type ACTIONTYPE =
  | { type: "setAllSessionData"; payload: InitialState["allSessionData"] }
  | { type: "setSessionData"; payload: InitialState["sessionData"] }
  | { type: "setCurrentSet"; payload: typeof initialState.currentSet }
  | { type: "doneSet"; payload: InitialState["currentSet"] }
  | { type: "nextSet"; payload: InitialState["sessionData"] };

function reducer(state: typeof initialState, action: ACTIONTYPE) {
  switch (action.type) {
    case "setAllSessionData":
      return { ...state, allSessionData: action.payload };
    case "setSessionData":
      return { ...state, sessionData: action.payload };
    case "setCurrentSet":
      return { ...state, currentSet: action.payload };
    case "doneSet":
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
                        weight: Number(action.payload.weight),
                        reps: Number(action.payload.reps),
                        status:
                          Number(action.payload.weight) *
                            Number(action.payload.reps) >
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

    case "nextSet":
      if (action.payload) {
        return {
          ...state,
          sessionData: action.payload,
        };
      }
    default:
      return state;
  }
}

const App = () => {
  const [isFinishSet, setIsFinishSet] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const sessionIsRest = useSessionStore.getState().isRest;
  const { toggleRest, isRest } = useSessionStore();

  console.log("🚀 ~ App ~ sessionIsRest:", sessionIsRest);

  useEffect(() => {
    const getSessionData = async () => {
      const res = await getItem("sessionData");
      if (res) {
        const filterToday = res.find((item: SessionData) => {
          const toDay = selectedDate;
          toDay.setHours(0, 0, 0, 0);
          const dataDay = new Date(item.date);
          dataDay.setHours(0, 0, 0, 0);
          return toDay.getTime() === dataDay.getTime();
        });

        dispatch({ type: "setAllSessionData", payload: res });

        dispatch({ type: "setSessionData", payload: filterToday });
      }
    };
    getSessionData();
  }, [selectedDate]);

  const handleFinishSet = (infoSet: InitialState["currentSet"]) => {
    if (!infoSet.active) return;
    dispatch({ type: "setCurrentSet", payload: infoSet });
    setIsFinishSet(!isFinishSet);
  };

  const handleRest = (infoSet: InitialState["currentSet"]) => {
    dispatch({ type: "doneSet", payload: infoSet });
    toggleRest && toggleRest();
  };

  const handleStopRest = (param: boolean) => {
    if (state.sessionData) {
      const updatedSession = { ...state.sessionData }; // Clone the session object to avoid mutation

      const allSets: Set[] = [];

      updatedSession.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          allSets.push({ ...set });
        });
      });

      let foundActive = false;

      const nextSet = allSets.map((set, index) => {
        if (set.active && !foundActive) {
          foundActive = true;
          set.active = false;

          if (index + 1 < allSets.length) {
            allSets[index + 1].active = true;
          }

          return { ...set, active: false };
        }

        return { ...set };
      });

      const findActiveSet = nextSet.find((set) => set.active);

      updatedSession.exercises = updatedSession.exercises.map((exercise) => {
        return {
          ...exercise,
          sets: [
            ...exercise.sets.map((set) => {
              return {
                ...set,
                active: set.id === findActiveSet?.id ? true : false,
              };
            }),
          ],
        };
      });

      dispatch({ type: "nextSet", payload: updatedSession });
    }

    toggleRest && toggleRest();
  };

  return (
    <View className="flex-1 mt-20">
      <Agenda
        onDayPress={(date: DateData) => {
          setSelectedDate(new Date(date.dateString));
        }}
        style={{}}
        items={{ items: [] }}
        renderEmptyData={() => {
          return (
            <SafeAreaView className="h-full bg-slate-50 relative">
              <View className="p-2 h-full">
                <View className="px-3 pt-3 pb-6 bg-slate-100 mb-[6px] rounded-[20px]">
                  <View className="mb-2 flex items-center justify-center gap-2">
                    <Text className="font-pbold text-xl text-slate-600">
                      {state.sessionData && state.sessionData.name}
                    </Text>
                    <Text className="font-plight text-[14px] text-slate-600">
                      Mon - 04/12/2024
                    </Text>
                    <Text className="font-plight text-xl text-slate-600">
                      Time: 04:20
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-center">
                  {isRest && (
                    <>
                      <Text className="font-plight text-xl text-slate-600">
                        Rest:{" "}
                      </Text>
                      <CountDownRest
                        seconds={
                          state.currentSet.restTime
                            ? state.currentSet.restTime
                            : 0
                        }
                        isRunning={isRest}
                        onStop={handleStopRest}
                      />
                    </>
                  )}
                </View>
                {state.sessionData ? (
                  <Exercise
                    session={state.sessionData}
                    handleFinishSet={handleFinishSet}
                  />
                ) : (
                  <View className="h-full flex flex-1 items-center mt-20">
                    <Text className="font-plight text-xl">No exercisess.</Text>
                  </View>
                )}
              </View>
              <ModalSetOfRep
                isVisible={isFinishSet}
                toggle={() => setIsFinishSet(false)}
                infoSet={state.currentSet}
                handleRest={handleRest}
              />
              <StatusBar style="light" backgroundColor="#161622" />
            </SafeAreaView>
          );
        }}
      />
    </View>
  );
};

export default App;
