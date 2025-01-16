import { SafeAreaView, Text, View, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import ModalSetOfRep from "@/components/ModalSetOfRep";
import { SessionData, Set } from "@/types/session";
import { Agenda, DateData } from "react-native-calendars";
import { InitialState, useSessionStore } from "@/store/useSessionStore";
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
import PrevIconButton from "@/components/ui/PrevButton";
import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
} from "@notifee/react-native";

const data = require("@/data/data.json");

const Session = () => {
  const [isFinishSet, setIsFinishSet] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const templates = useStore((state) => state.templates);
  const { templateId, permissionNotification } = useLocalSearchParams();
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

  const alarmTime = new Date();

  const createNotificationChannel = async () => {
    await notifee.createChannel({
      id: "default",
      name: "Default Channel",
      importance: AndroidImportance.HIGH,
      sound: "default",
    });
  };

  const triggerNotification = async () => {
    try {
      // Create channel for Android
      if (Platform.OS === "android") {
        await createNotificationChannel();
      }

      // Request permission
      if (permissionNotification) {
        await notifee.displayNotification({
          title: "Fitness Tracking",
          body: `Time to workout! Session started at ${alarmTime?.toLocaleTimeString()}`,
          android: {
            channelId: "default",
            sound: "default",
            pressAction: {
              id: "default",
            },
          },
          ios: {
            sound: "default",
          },
        });
      }
    } catch (error) {
      console.error("Failed to trigger notification:", error);
    }
  };

  useEffect(() => {
    if (Platform.OS === "android") {
      createNotificationChannel();
    }
  }, []);

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
    <SafeAreaView className="h-full bg-zinc-900 flex-1">
      <View className="ml-2 mb-3">
        <PrevIconButton
          onClick={() => {
            router.back();
          }}
        />
      </View>
      <Agenda
        onDayPress={(date: DateData) => {
          triggerNotification();
          setSelectedDate(new Date(date.dateString));
        }}
        items={{ items: [] }}
        theme={{
          // Background colors
          backgroundColor: "#121212",
          calendarBackground: "#121212",

          // Header styling
          textSectionTitleColor: "#ffffff",
          textSectionTitleDisabledColor: "#666666",
          selectedDayBackgroundColor: "#ffffff", // Blue circle for selected date
          selectedDayTextColor: "#27272a",
          todayTextColor: "#ffffff",
          todayBackgroundColor: "#3f3f46",
          dayTextColor: "#ffffff",
          textDisabledColor: "#404040",
          dotColor: "#2196F3",
          selectedDotColor: "#ffffff",
          arrowColor: "#ffffff",
          disabledArrowColor: "#404040",
          monthTextColor: "#808080", // Gray color for month text as shown in image

          // Text styling
          textDayFontSize: 16,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 14,
          textMonthFontWeight: "300", // Light weight for month text
          textDayFontWeight: "400",
          textDayHeaderFontWeight: "400",
        }}
        renderEmptyData={() => {
          return (
            <SafeAreaView className="h-full bg-zinc-950">
              <View className="p-2 h-full">
                <View className="px-3 pt-3 pb-6 bg-zinc-900 mb-[6px] rounded-[20px]">
                  {sessionAnother && (
                    <View className="mb-2 flex items-center justify-center gap-2">
                      <Text className="font-pbold text-xl text-zinc-50">
                        {sessionAnother && sessionAnother.name}
                      </Text>
                      {!isAnother && (
                        <>
                          <Text className="font-psemibold text-xl text-zinc-50">
                            {formatTime(elapsedTime)}
                          </Text>
                          <Button
                            variant="solid"
                            onPress={() => setShowExitModal(true)}
                            className="mt-2"
                          >
                            <ButtonText>Finish Session</ButtonText>
                          </Button>
                        </>
                      )}
                      {/* {sessionSelect.isDone && (
                        <Text className="font-plight text-xl text-zinc-600">
                          Session is done
                        </Text>
                      )} */}
                    </View>
                  )}
                </View>
                <>
                  <View className={`${isAnother ? "hidden" : ""}`}>
                    {sessionSelect ? (
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
                    ) : (
                      <View className="h-full flex flex-1 items-center mt-20">
                        <Text className="font-plight text-xl">
                          No exercisess.
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className={`${!isAnother ? "hidden" : ""}`}>
                    {sessionAnother ? (
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
                    ) : (
                      <View className="h-full flex flex-1 items-center mt-20">
                        <Text className="font-plight text-xl">
                          No exercisess.
                        </Text>
                      </View>
                    )}
                  </View>
                </>
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
