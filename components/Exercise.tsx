import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SessionData } from "@/app";

type ExerciesProps = {
  session: SessionData;
};

const Exercise = ({ session }: ExerciesProps) => {
  return (
    <ScrollView className="px-3 pt-3 pb-6 bg-[#DDD8D8] rounded-[20px] mt-2">
      {session &&
        session.exercises.map((exercise) => (
          <View className="mb-[27px] relative" key={exercise.id}>
            <View className="absolute right-1/2 left-1/2 z-10">
              <View className="w-full flex items-center mb-[6px]">
                <View className="rounded-[20px] bg-[#B3ADAD] flex items-center p-2 w-[300px]">
                  <Text className="font-pbold">{exercise.name}</Text>
                </View>
              </View>
            </View>

            <View className="mt-6">
              {exercise.sets.map((set, index) => (
                <View
                  key={set.id}
                  className={`${
                    set.active ? "bg-[#D6D0D0]" : "bg-[#BFBABA]"
                  }  px-[19px] py-[22px] rounded-[20px] mb-[6px]`}
                >
                  <Text>
                    Set {index + 1}: {set.reps} reps x {set.weight}kg
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
    </ScrollView>
  );
};

export default Exercise;

const styles = StyleSheet.create({});
