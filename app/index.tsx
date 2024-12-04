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

interface InitialState {
  sessionData: SessionData[];
}

const initialState: InitialState = {
  sessionData: sessionData,
};

type ACTIONTYPE =
  | { type: "increment"; payload: number }
  | { type: "decrement"; payload: string };

function reducer(state: typeof initialState, action: ACTIONTYPE) {
  switch (action.type) {
    // case "increment":
    //   return { count: state.count + action.payload };
    // case "decrement":
    //   return { count: state.count - Number(action.payload) };
    default:
      return state;
      throw new Error();
  }
}

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  console.log("state.sessionData", state.sessionData[0]);

  return (
    <SafeAreaView className="h-full bg-white">
      <View className="p-2 h-full">
        <View className="px-3 pt-3 pb-6 bg-[#DDD8D8] mb-[6px] rounded-[20px]">
          <View className="mb-2">
            <Text className="font-pbold text-xl">
              Upper Body Strength Training
            </Text>
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
        <Exercise session={state.sessionData[0]} />
      </View>
      <StatusBar style="light" backgroundColor="#161622" />
    </SafeAreaView>
  );
};

export default App;
