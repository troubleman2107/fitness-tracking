import { SafeAreaView, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import Exercise from "@/components/Exercise";
import ModalSetOfRep from "@/components/ModalSetOfRep";
import CountDownRest from "@/components/CountDownRest";
import { loadData } from "@/utils/AsyncStorage";
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
} from "@/components/ui/modal";
import { Button, ButtonText } from "@/components/ui/button";
import { router, useNavigation } from "expo-router";

const data = require("@/data/data.json");

const Session = () => {
  const [isFinishSet, setIsFinishSet] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDateNow, setIsDateNow] = useState(false);
  const [sessionShow, setSessionShow] = useState<SessionData>();
  const templateSelect = useStore((state) => state.templateSelect);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const saveTemplate = useStore((state) => state.saveTemplate);
  const [showExitModal, setShowExitModal] = useState(false);
  const navigation = useNavigation();

  const { isRest, currentSet, sessionData, toggleRest, doneSet } =
    useSessionStore();

  const getDateWithoutTime = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  useEffect(() => {
    if (templateSelect) {
      useSessionStore.setState(() => ({
        allSessionData: templateSelect.sessions,
      }));

      useSessionStore.setState(() => ({
        sessionData: (() => {
          const foundSession = templateSelect.sessions.find((item) => {
            const toDay = getDateWithoutTime(selectedDate);
            const dataDay = getDateWithoutTime(new Date(item.date));
            return toDay.getTime() === dataDay.getTime();
          });

          if (foundSession) {
            return {
              ...foundSession,
              exercises: foundSession.exercises.map(
                (exercise, exerciseIndex) => ({
                  ...exercise,
                  sets: exercise.sets.map((set, setIndex) => ({
                    ...set,
                    active: exerciseIndex === 0 && setIndex === 0,
                  })),
                })
              ),
            };
          }
          return foundSession;
        })(),
      }));
    }
  }, [templateSelect, selectedDate]);

  // useEffect(() => {
  //   const getSessionData = async () => {
  //     const res = await loadData("sessionData");
  //     if (res) {
  //       const filterToday = res.find((item: SessionData) => {
  //         const toDay = selectedDate;
  //         toDay.setHours(0, 0, 0, 0);
  //         const dataDay = new Date(item.date);
  //         dataDay.setHours(0, 0, 0, 0);
  //         return toDay.getTime() === dataDay.getTime();
  //       });

  //       useSessionStore.setState(() => ({
  //         allSessionData: res,
  //       }));

  //       useSessionStore.setState(() => ({
  //         sessionData: filterToday,
  //       }));
  //     }
  //   };
  //   getSessionData();
  // }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (sessionData) {
      setStartTime(Date.now());
      setElapsedTime(0);

      intervalId = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [sessionData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!sessionData) {
        // If no session is active, allow navigation
        return;
      }

      // Prevent default navigation
      e.preventDefault();

      // Show confirmation modal
      setShowExitModal(true);
    });

    return unsubscribe;
  }, [navigation, sessionData]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const handleFinishSet = (infoSet: InitialState["currentSet"]) => {
    if (!infoSet.active && !infoSet.isDone) return;
    useSessionStore.setState((state) => ({
      currentSet: infoSet,
    }));
    setIsFinishSet(!isFinishSet);
  };

  const handleRest = (infoSet: InitialState["currentSet"]) => {
    console.log("🚀 ~ handleRest ~ infoSet:", infoSet);
    doneSet && doneSet(infoSet);

    // Update template store
    if (templateSelect && sessionData) {
      const updatedTemplate = {
        ...templateSelect,
        sessions: templateSelect.sessions.map((session) => {
          if (session.date === sessionData.date) {
            return {
              ...session,
              exercises: session.exercises.map((exercise) => ({
                ...exercise,
                sets: exercise.sets.map((set) =>
                  set.id === infoSet.id
                    ? { ...set, ...infoSet, isDone: true }
                    : set
                ),
              })),
            };
          }
          return session;
        }),
      };

      console.log("updatedTemplate", updatedTemplate);

      saveTemplate(updatedTemplate);
    }

    if (infoSet.isDone) {
      toggleRest && toggleRest();
    }
  };

  const handleStopRest = (param: boolean) => {
    if (sessionData) {
      const updatedSession = { ...sessionData }; // Clone the session object to avoid mutation

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

      useSessionStore.setState(() => ({
        sessionData: updatedSession,
      }));
    }

    toggleRest && toggleRest();
  };

  const handleFinishSession = () => {
    // Reset timer states
    setElapsedTime(0);
    setStartTime(Date.now());

    // Close modal
    setShowExitModal(false);

    // Reset session store but maintain the template selection
    useSessionStore.setState(useSessionStore.getInitialState());

    // Reload the session data for the selected date
    if (templateSelect) {
      const foundSession = templateSelect.sessions.find((item) => {
        const toDay = getDateWithoutTime(selectedDate);
        const dataDay = getDateWithoutTime(new Date(item.date));
        return toDay.getTime() === dataDay.getTime();
      });

      if (foundSession) {
        useSessionStore.setState(() => ({
          allSessionData: templateSelect.sessions,
          sessionData: {
            ...foundSession,
            exercises: foundSession.exercises.map(
              (exercise, exerciseIndex) => ({
                ...exercise,
                sets: exercise.sets.map((set, setIndex) => ({
                  ...set,
                  active: exerciseIndex === 0 && setIndex === 0,
                })),
              })
            ),
          },
        }));
      }
    }

    // Navigate back
    router.navigate("/(tabs)/create");
  };

  return (
    <SafeAreaView className="h-full bg-slate-50 flex-1">
      <Agenda
        onDayPress={(date: DateData) => {
          setSelectedDate(new Date(date.dateString));
        }}
        // theme={{ calendarBackground: "#ecfdf5", agendaKnobColor: "green" }}
        items={{ items: [] }}
        renderEmptyData={() => {
          return (
            <SafeAreaView className="h-full bg-slate-50">
              <View className="p-2 h-full">
                <View className="px-3 pt-3 pb-6 bg-slate-100 mb-[6px] rounded-[20px]">
                  {sessionData && (
                    <View className="mb-2 flex items-center justify-center gap-2">
                      <Text className="font-pbold text-xl text-slate-600">
                        {sessionData && sessionData.name}
                      </Text>
                      <Text className="font-plight text-[14px] text-slate-600">
                        {`${new Date(sessionData.date).toLocaleString(
                          "default",
                          { weekday: "short" }
                        )} - ${new Date(sessionData.date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}`}
                      </Text>
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
                    </View>
                  )}
                </View>

                {sessionData ? (
                  <>
                    <View className="flex-row justify-center">
                      {isRest && (
                        <>
                          <Text className="font-plight text-xl text-slate-600">
                            Rest:{" "}
                          </Text>
                          <CountDownRest
                            seconds={
                              currentSet.restTime ? currentSet.restTime : 0
                            }
                            isRunning={isRest}
                            onStop={handleStopRest}
                          />
                        </>
                      )}
                    </View>
                    <Exercise
                      session={sessionData}
                      handleFinishSet={handleFinishSet}
                    />
                  </>
                ) : (
                  <View className="h-full flex flex-1 items-center mt-20">
                    <Text className="font-plight text-xl">No exercisess.</Text>
                  </View>
                )}
              </View>
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
              <StatusBar style="light" backgroundColor="#161622" />
            </SafeAreaView>
          );
        }}
      />
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)}>
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
            <Button variant="solid" onPress={handleFinishSession}>
              <ButtonText>Finish Session</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
};

export default Session;
