import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { InitialState, SessionData } from "@/types/session";

type ExerciesProps = {
  session: SessionData;
  handleFinishSet?: (infoSet: InitialState["currentSet"]) => void;
};

const Exercise = ({ session, handleFinishSet }: ExerciesProps) => {
  const handleOnSetPress = (infoSet: InitialState["currentSet"]) => {
    if (handleFinishSet) {
      handleFinishSet(infoSet);
    }
  };

  return (
    <ScrollView className="px-3 pt-3 pb-6 bg-slate-100 rounded-[20px] mt-2">
      {session &&
        session.exercises.map((exercise) => (
          <View className="mb-[27px] relative" key={exercise.id}>
            <View className="absolute right-1/2 left-1/2 z-10">
              <View className="w-full flex items-center mb-[6px]">
                <View className="rounded-[20px] bg-slate-300 flex items-center p-2 w-[300px]">
                  <Text className="font-pbold text-slate-600">
                    {exercise.name}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-6">
              {exercise.sets.map((set, index) => (
                <TouchableOpacity
                  onPress={() =>
                    handleOnSetPress({
                      reps: set.reps,
                      weight: set.weight ? set.weight : null,
                      id: set.id,
                      active: set.active,
                      restTime: set.restTime,
                    })
                  }
                  key={set.id}
                >
                  <View
                    className={`${
                      set.status
                        ? set.status === "goal"
                          ? "bg-lime-400"
                          : "bg-red-400"
                        : set.active
                        ? "bg-slate-400"
                        : "bg-slate-200"
                    }  px-[19px] py-[22px] rounded-[20px] mb-[6px] flex flex-row justify-between items-center`}
                  >
                    <Text className="font-pregular">
                      Set {index + 1}: {set.reps} reps x {set.weight}kg
                    </Text>
                    {set.status && (
                      <Text className="font-pbold text-xs">{`${
                        set.status === "goal" ? "Level Up ✊" : "Nice Try 🤌"
                      } `}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
    </ScrollView>
  );
};

export default Exercise;

const styles = StyleSheet.create({});
