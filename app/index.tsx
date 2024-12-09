import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useReducer, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { images } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { sessionData } from "@/data/mock-data";
import Exercises from "@/components/Exercise";
import Exercise from "@/components/Exercise";
import ModalSetOfRep from "@/components/ModalSetOfRep";
import CountDownRest from "@/components/CountDownRest";
import { set } from "date-fns";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: Set[];
}
interface Set {
  id: string;
  reps: number | null;
  weight?: number | null;
  restTime?: number | null;
  active?: boolean;
  status?: string;
}
export interface SessionData {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
}

export interface InitialState {
  sessionData: SessionData;
  currentSet: Set;
}

const initialState: InitialState = {
  sessionData: sessionData[0],
  currentSet: {
    reps: null,
    weight: null,
    id: "",
    active: false,
    restTime: null,
  },
};

type ACTIONTYPE =
  | { type: "setCurrentSet"; payload: typeof initialState.currentSet }
  | { type: "doneSet"; payload: InitialState["currentSet"] }
  | { type: "nextSet"; payload: InitialState["sessionData"] };

function reducer(state: typeof initialState, action: ACTIONTYPE) {
  switch (action.type) {
    case "setCurrentSet":
      return { ...state, currentSet: action.payload };
    case "doneSet":
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
    case "nextSet":
      return {
        ...state,
        sessionData: action.payload,
      };

    //   ...state,
    //   sessionData: {
    //     ...state.sessionData,
    //     exercises: state.sessionData.exercises,
    //   },
    // };

    default:
      return state;
  }
}

const App = () => {
  const [isFinishSet, setIsFinishSet] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isRest, setIsRest] = useState(false);

  console.log("state.currentSet", state.currentSet);

  const handleFinishSet = (infoSet: InitialState["currentSet"]) => {
    if (!infoSet.active) return;
    dispatch({ type: "setCurrentSet", payload: infoSet });
    setIsFinishSet(!isFinishSet);
  };

  const handleRest = (infoSet: InitialState["currentSet"]) => {
    dispatch({ type: "doneSet", payload: infoSet });
    setIsRest(true);
  };

  const handleStopRest = (param: boolean) => {
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
    setIsRest(false);
  };

  return (
    <SafeAreaView className="h-full bg-slate-50">
      <View className="p-2 h-full">
        <View className="px-3 pt-3 pb-6 bg-slate-100 mb-[6px] rounded-[20px]">
          <View className="mb-2 flex items-center justify-center gap-2">
            <Text className="font-pbold text-xl text-slate-600">
              {state.sessionData.name}
            </Text>
            <Text className="font-plight text-[14px] text-slate-600">
              Mon - 04/12/2024
            </Text>
            <Text className="font-plight text-xl text-slate-600">
              Time: 04:20
            </Text>
          </View>
          <View className="flex flex-row gap-3 overflow-hidden">
            {Array.from({ length: 3 }, (i, k) => {
              return (
                <View
                  key={k}
                  className="w-[30px] h-[45px] bg-slate-200 rounded-[10px] mt-[14px]"
                ></View>
              );
            })}
          </View>
        </View>
        <View className="flex-row justify-center ">
          {isRest && (
            <>
              <Text className="font-plight text-xl text-slate-600">Rest: </Text>
              <CountDownRest
                seconds={
                  state.currentSet.restTime ? state.currentSet.restTime : 0
                }
                isRunning={isRest}
                onStop={handleStopRest}
              />
            </>
          )}
        </View>
        <Exercise
          session={state.sessionData}
          handleFinishSet={handleFinishSet}
        />
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
};

export default App;
