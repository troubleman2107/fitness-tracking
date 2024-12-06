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
import BottomSheetComponent from "@/components/BottomSheetComponent";

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
    reps: string;
    weight: string;
    id: string;
  };
}

const initialState: InitialState = {
  sessionData: sessionData[0],
  currentSet: {
    reps: "",
    weight: "",
    id: "",
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

  const handleFinishSet = (infoSet: InitialState["currentSet"]) => {
    dispatch({ type: "setCurrentSet", payload: infoSet });
    setIsFinishSet(!isFinishSet);
  };

  const handleRest = (infoSet: InitialState["currentSet"]) => {
    dispatch({ type: "doneSet", payload: infoSet });
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <View className="p-2 h-full">
        <View className="px-3 pt-3 pb-6 bg-[#DDD8D8] mb-[6px] rounded-[20px]">
          <View className="mb-2">
            <Text className="font-pbold text-xl">{state.sessionData.name}</Text>
            <Text className="font-plight text-[14px]">Mon - 04/12/2024</Text>
          </View>
          <Text className="font-pbold text-xl">Time: 04:20</Text>
          <View className="flex flex-row gap-3 overflow-hidden">
            {Array.from({ length: 10 }, (i, k) => {
              return (
                <View
                  key={k}
                  className="w-[30px] h-[45px] bg-[#B3ADAD] rounded-[10px] mt-[14px]"
                ></View>
              );
            })}
          </View>
        </View>
        <Exercise
          session={state.sessionData}
          handleFinishSet={handleFinishSet}
        />
      </View>
      <BottomSheetComponent
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
