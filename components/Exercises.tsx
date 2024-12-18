import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Exercise, SessionData } from "@/types/session";
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
  console.log("🚀 ~ Exercises ~ exercises:", exercises);
  const [isFinishSet, setIsFinishSet] = useState(false);
  const [currentSet, setCurrentSet] = useState<InitialState["currentSet"]>(
    {} as InitialState["currentSet"]
  );
  const [isRest, setIsRest] = useState(false);

  const sets = useStore((state) => state.sets);
  const updateSetInTemplate = useStore((state) => state.updateSetInTemplate);
  const progressToNextSet = useStore((state) => state.progressToNextSet);

  useEffect(() => {
    const activeSet = exercises
      .find((exercise) => exercise.sets.find((set) => set.active))
      ?.sets.find((set) => set.active);

    if (activeSet) {
      setCurrentSet(activeSet);
    }
  }, [exercises]);

  const handleOnSetPress = (infoSet: InitialState["currentSet"]) => {
    if (!infoSet.active && !infoSet.isDone) return;
    setIsFinishSet(!isFinishSet);
  };

  const handleRest = (currentSet: InitialState["currentSet"]) => {
    // Update the sets state using the values from above
    const updateSet = sets.map((set) => {
      if (set.id === currentSet.id) {
        return {
          ...set,
          isDone: true,
          reps: currentSet.reps,
          weight: currentSet.weight,
        };
      }
      return set;
    });

    // Use the actions we got from the store
    updateSetInTemplate({
      ...currentSet,
      isDone: true,
    });

    setIsRest(true);
  };

  const handleNextSet = () => {
    // progressToNextSet();

    // const nextSet = exercises.sets.map((set, index) => {
    //   if (set.active && !foundActive) {
    //     foundActive = true;
    //     set.active = false;

    //     if (index + 1 < allSets.length) {
    //       allSets[index + 1].active = true;
    //     }

    //     return { ...set, active: false };
    //   }

    //   return { ...set };
    // });

    // const updateExercies = exercises.map((exercise) => {
    //   return {
    //     ...exercise,
    //     sets: [
    //       ...exercise.sets.map((set) => {
    //         return {
    //           ...set,
    //           active: set.id === findActiveSet?.id ? true : false,
    //         };
    //       }),
    //     ],
    //   };
    // });
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
            <Text className="font-plight text-xl text-slate-600">Rest: </Text>
            <CountDownRest
              seconds={currentSet.restTime ? currentSet.restTime : 0}
              isRunning={isRest}
              onStop={handleNextSet}
            />
          </>
        )}
      </View>
      <ScrollView className="px-3 pt-3 pb-6 bg-slate-100 rounded-[20px] mt-2">
        {exercises &&
          exercises.map((exercise) => (
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
                        isDone: set.isDone,
                      })
                    }
                    key={set.id}
                  >
                    <View
                      className={`${
                        set.status
                          ? status(set.status)?.color
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
                          status(set.status)?.text
                        } `}</Text>
                      )}
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
    </>
  );
};

export default Exercises;

const styles = StyleSheet.create({});
