import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { InitialState, SessionData } from "@/app";

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
                <TouchableOpacity
                  onPress={() =>
                    handleOnSetPress({
                      reps: String(set.reps),
                      weight: String(set.weight),
                      id: set.id,
                    })
                  }
                  key={set.id}
                >
                  <View
                    className={`${
                      set.active ? "bg-[#D6D0D0]" : "bg-[#BFBABA]"
                    }  px-[19px] py-[22px] rounded-[20px] mb-[6px]`}
                  >
                    <Text>
                      Set {index + 1}: {set.reps} reps x {set.weight}kg
                    </Text>
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
