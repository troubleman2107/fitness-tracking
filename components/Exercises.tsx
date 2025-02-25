import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Exercise, SessionData, Set } from "@/types/session";
import { InitialState } from "@/store/useSessionStore";
import CountDownRest from "./CountDownRest";
import ModalSetOfRep from "./ModalSetOfRep";
import {
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "./ui/actionsheet";
import { Actionsheet } from "./ui/actionsheet";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useStore } from "@/store/useTemplateStore";
import { templateService } from "@/src/lib/services/templateService";
import { supabase } from "@/src/lib/supabaseClient";
import { Alert } from "react-native";

type ExerciesProps = {
  exercises: Exercise[];
  handleFinishSet?: (infoSet: InitialState["currentSet"]) => void;
  handleStopRest?: () => void;
};

const Exercises = ({
  exercises,
  handleFinishSet,
  handleStopRest,
}: ExerciesProps) => {
  const [isFinishSet, setIsFinishSet] = useState(false);
  const [currentSet, setCurrentSet] = useState<InitialState["currentSet"]>(
    {} as InitialState["currentSet"]
  );
  const [isRest, setIsRest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const activeSet = exercises
      .find((exercise) => exercise.sets.find((set) => set.active))
      ?.sets.find((set) => set.active);

    if (activeSet) {
      setCurrentSet(activeSet);
    }
  }, [exercises]);

  const handleOnSetPress = (infoSet: Set) => {
    if (!infoSet.active && !infoSet.isDone) return;
    setIsFinishSet(!isFinishSet);
  };

  const handleRest = async (currentSet: InitialState["currentSet"]) => {
    try {
      setIsLoading(true);
      // Find the current exercise that contains the active set
      const currentExercise = exercises.find((exercise) =>
        exercise.sets.some((set) => set.id === currentSet.id)
      );

      if (!currentExercise) {
        throw new Error("Could not find current exercise");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      // Save the completed set
      await templateService.saveSet(
        currentExercise.id,
        {
          id: currentSet.id,
          weight: currentSet.weight || 0,
          reps: currentSet.reps,
          rest_time: currentSet.rest_time,
          setOrder: currentSet.setOrder,
        },
        user.id
      );

      if (handleFinishSet) {
        handleFinishSet(currentSet);
      }

      setIsRest(true);
    } catch (error) {
      console.error("Failed to save set:", error);
      // You might want to add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextSet = () => {
    console.log("notifi");
    if (handleStopRest) {
      handleStopRest();
    }
    setIsRest(false);
  };

  const status = (status: string) => {
    switch (status) {
      case "goal":
        return {
          color: "bg-lime-400",
          text: "Level Up ✊",
        };
      case "down":
        return {
          color: "bg-red-400",
          text: "Nice Try 🤌",
        };
      default:
        break;
    }
  };

  return (
    <>
      <View className="flex-row justify-center">
        {isRest && (
          <>
            <Text className="font-plight text-xl text-zinc-50">Rest: </Text>
            <CountDownRest
              seconds={currentSet.rest_time ? currentSet.rest_time : 0}
              isRunning={isRest}
              onStop={handleNextSet}
            />
          </>
        )}
      </View>
      <ScrollView className="px-3 pt-3 pb-6 bg-zinc-900 rounded-[20px] mt-2">
        {exercises &&
          exercises.map((exercise) => (
            <View className="mb-[27px] relative" key={exercise.id}>
              <View className="absolute right-1/2 left-1/2 z-10">
                <View className="w-full flex items-center mb-[6px]">
                  <View className="rounded-[20px] bg-zinc-700 flex items-center p-2 w-[300px]">
                    <Text className="font-pbold text-zinc-50">
                      {exercise.name}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-6">
                {exercise.sets
                  .sort((a, b) => Number(a.setOrder) - Number(b.setOrder)) // Sort in descending order
                  .map((set, index) => (
                    <TouchableOpacity
                      onPress={() =>
                        handleOnSetPress({
                          reps: set.reps,
                          weight: set.weight ? set.weight : null,
                          id: set.id,
                          active: set.active,
                          rest_time: set.rest_time,
                          isDone: set.isDone,
                        })
                      }
                      key={set.id}
                    >
                      <View
                        className={`${
                          set.active ? "bg-zinc-800" : "bg-zinc-600"
                        }  px-[19px] py-[22px] rounded-[20px] mb-[6px] flex flex-row justify-between items-center`}
                      >
                        <Text className="font-pregular text-zinc-50">
                          Set {index + 1}: {set.weight}kg x {set.reps} reps
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          ))}
      </ScrollView>
      <Actionsheet
        useRNModal={true}
        snapPoints={[25]}
        isOpen={isFinishSet}
        onClose={() => setIsFinishSet(false)}
      >
        <KeyboardStickyView offset={{ closed: 0, opened: 20 }}>
          <ActionsheetBackdrop
            onPress={() => {
              setIsFinishSet(false);
            }}
          />
          <ActionsheetContent className="p-2">
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <ModalSetOfRep
              infoSet={currentSet}
              toggle={() => setIsFinishSet(false)}
              handleRest={handleRest}
            />
          </ActionsheetContent>
        </KeyboardStickyView>
      </Actionsheet>

      {isLoading && (
        <View
          style={StyleSheet.absoluteFill}
          className="bg-black/30 items-center justify-center"
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </>
  );
};

export default Exercises;

const styles = StyleSheet.create({});
