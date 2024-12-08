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

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: Set[];
}
interface Set {
  id: string;
  reps: number;
  weight?: number;
  restTime?: number;
  active?: boolean;
}
export interface SessionData {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
}

export interface InitialState {
  sessionData: SessionData;
  currentSet: {
    reps: number | null;
    weight: number | null;
    id: string;
    active?: boolean;
  };
}

const initialState: InitialState = {
  sessionData: sessionData[0],
  currentSet: {
    reps: null,
    weight: null,
    id: "",
    active: false,
  },
};

type ACTIONTYPE =
  | { type: "setCurrentSet"; payload: typeof initialState.currentSet }
  | { type: "doneSet"; payload: InitialState["currentSet"] };

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
            if (exercise.id === "ex_001") {
              return {
                ...exercise,
                sets: exercise.sets.map((set) => {
                  if (set.active) {
                    return {
                      ...set,
                      weight: Number(action.payload.weight),
                      reps: Number(action.payload.reps),
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

    default:
      return state;
  }
}

const App = () => {
  const [isFinishSet, setIsFinishSet] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isRest, setIsRest] = useState(false);

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
    setIsRest(param);
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
        <CountDownRest seconds={3} isRunning={isRest} onStop={handleStopRest} />
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
