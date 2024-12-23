import { SafeAreaView, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import ModalSetOfRep from "@/components/ModalSetOfRep";
import { SessionData, Set } from "@/types/session";
import { Agenda, DateData } from "react-native-calendars";
import { InitialState, useSessionStore } from "@/store/useSessionStore";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useStore } from "@/store/useTemplateStore";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalBackdrop,
} from "@/components/ui/modal";
import { Button, ButtonText } from "@/components/ui/button";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { getDateWithoutTime } from "@/utils/dateHelpers";
import Exercises from "@/components/Exercises";
import { useSessionTimer } from "@/hooks/useSessionTimer";

const data = require("@/data/data.json");

const Session = () => {
  const [isFinishSet, setIsFinishSet] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const templates = useStore((state) => state.templates);
  const { templateId } = useLocalSearchParams();
  const templateById = templates.find((template) => {
    return template.id === templateId;
  });
  const [showExitModal, setShowExitModal] = useState(false);

  //Active first exercise of session today
  const initialTemplate = {
    ...templateById,
    sessions: templateById?.sessions?.map((session) => {
      if (
        getDateWithoutTime(new Date(session.date)).getTime() ===
        getDateWithoutTime(selectedDate).getTime()
      ) {
        return {
          ...session,
          exercises: session?.exercises?.map((exercise, indexExercise) => ({
            ...exercise,
            sets: exercise?.sets?.map((set, indexSet) => ({
              ...set,
              active: indexExercise === 0 && set.setOrder === "1",
            })),
          })),
        };
      }
      return { ...session };
    }),
  };

  const [sessions, setSessions] = useState(initialTemplate.sessions);
  const [sessionSelect, setSessionSelect] = useState<SessionData | null>(null);
  const [sessionAnother, setSessionAnother] = useState<SessionData | null>(
    null
  );
  const [isAnother, setIsAnother] = useState<boolean>(false);

  const dayNow = getDateWithoutTime(new Date());

  const { elapsedTime, formatTime, resetTimer } = useSessionTimer(true);

  useEffect(() => {
    const selectDay = getDateWithoutTime(selectedDate);
    const foundSession = sessions?.find((session) => {
      const dataDay = getDateWithoutTime(new Date(session.date));
      if (selectDay.getTime() !== dayNow.getTime()) {
        setIsAnother(true);
      } else {
        setIsAnother(false);
      }

      return selectDay.getTime() === dataDay.getTime();
    });

    setSessionAnother(
      foundSession
        ? ({
            ...foundSession,
            exercises:
              foundSession.exercises?.map((exercise) => ({
                ...exercise,
                sets: exercise.sets || [],
              })) || [],
          } as SessionData)
        : null
    );
  }, [selectedDate]);

  useEffect(() => {
    const foundSession = sessions?.find((session) => {
      const selectDay = getDateWithoutTime(new Date());
      const dataDay = getDateWithoutTime(new Date(session.date));
      return selectDay.getTime() === dataDay.getTime();
    });

    setSessionSelect(
      foundSession
        ? ({
            ...foundSession,
            exercises:
              foundSession.exercises?.map((exercise) => ({
                ...exercise,
                sets: exercise.sets || [],
              })) || [],
          } as SessionData)
        : null
    );
  }, []);

  const handleFinishSet = (infoSet: InitialState["currentSet"]) => {
    const updatedSessionSelect: SessionData = {
      ...sessionSelect!,
      exercises: sessionSelect!.exercises!.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) =>
          set.id === infoSet.id ? { ...set, ...infoSet, isDone: true } : set
        ),
      })),
    };
    setSessionSelect(updatedSessionSelect);
  };

  const handleStopRest = () => {
    if (sessionSelect) {
      const updatedSession = { ...sessionSelect }; // Clone the session object to avoid mutation

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

      setSessionSelect(updatedSession);
    }
  };

  return (
    <SafeAreaView className="h-full bg-slate-50 flex-1">
      <Agenda
        onDayPress={(date: DateData) => {
          setSelectedDate(new Date(date.dateString));
        }}
        items={{ items: [] }}
        renderEmptyData={() => {
          return (
            <SafeAreaView className="h-full bg-slate-50">
              <View className="p-2 h-full">
                <View className="px-3 pt-3 pb-6 bg-slate-100 mb-[6px] rounded-[20px]">
                  {sessionAnother && (
                    <View className="mb-2 flex items-center justify-center gap-2">
                      <Text className="font-pbold text-xl text-slate-600">
                        {sessionAnother && sessionAnother.name}
                      </Text>
                      <Text className="font-plight text-[14px] text-slate-600">
                        {`${new Date(sessionAnother.date).toLocaleString(
                          "default",
                          { weekday: "short" }
                        )} - ${new Date(sessionAnother.date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}`}
                      </Text>
                      {!isAnother && (
                        <>
                          <Text className="font-plight text-xl text-slate-600">
                            Time: {formatTime(elapsedTime)}
                          </Text>
                          <Button
                            variant="solid"
                            onPress={() => setShowExitModal(true)}
                            className="mt-2 bg-red-500"
                          >
                            <ButtonText>Finish Session</ButtonText>
                          </Button>
                        </>
                      )}
                      {/* {sessionSelect.isDone && (
                        <Text className="font-plight text-xl text-slate-600">
                          Session is done
                        </Text>
                      )} */}
                    </View>
                  )}
                </View>
                {sessionSelect ? (
                  <>
                    {sessionSelect ? (
                      <View className={`${isAnother ? "hidden" : ""}`}>
                        <Exercises
                          exercises={
                            sessionSelect?.exercises?.map((exercise) => ({
                              ...exercise,
                              sets: exercise.sets || [],
                            })) || []
                          }
                          handleFinishSet={handleFinishSet}
                          handleStopRest={handleStopRest}
                        />
                      </View>
                    ) : (
                      <View className="h-full flex flex-1 items-center mt-20">
                        <Text className="font-plight text-xl">
                          No exercisess.
                        </Text>
                      </View>
                    )}

                    {sessionAnother ? (
                      <View className={`${!isAnother ? "hidden" : ""}`}>
                        <Exercises
                          exercises={
                            sessionAnother?.exercises?.map((exercise) => ({
                              ...exercise,
                              sets: exercise.sets || [],
                            })) || []
                          }
                          handleFinishSet={handleFinishSet}
                          handleStopRest={handleStopRest}
                        />
                      </View>
                    ) : (
                      <View className="h-full flex flex-1 items-center mt-20">
                        <Text className="font-plight text-xl">
                          No exercisess.
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View className="h-full flex flex-1 items-center mt-20">
                    <Text className="font-plight text-xl">No exercisess.</Text>
                  </View>
                )}
              </View>
            </SafeAreaView>
          );
        }}
      />
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalBody>
            <Text className="text-center text-lg">
              Are you sure you want to finish this session?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              onPress={() => setShowExitModal(false)}
              className="mr-2"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              variant="solid"
              onPress={() => {
                setShowExitModal(false);
                resetTimer();
                router.push("/(tabs)/create");
              }}
            >
              <ButtonText>Finish Session</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
};

export default Session;
