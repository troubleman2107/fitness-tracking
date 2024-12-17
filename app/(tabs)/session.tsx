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

const data = require("@/data/data.json");

const Session = () => {
  const [isFinishSet, setIsFinishSet] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDateNow, setIsDateNow] = useState(false);
  const [sessionShow, setSessionShow] = useState<SessionData>();
  const templateSelect = useStore((state) => state.templateSelect);

  const {
    isRest,
    currentSet,
    sessionData,
    allSessionData,
    toggleRest,
    doneSet,
  } = useSessionStore();

  const getDateWithoutTime = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  useEffect(() => {
    if (selectedDate) {
      const toDay = getDateWithoutTime(new Date());
      const dataDay = getDateWithoutTime(selectedDate);
      // const setActiveSessionData = {
      //   ...sessionData,
      //   exercises: sessionData?.exercises.map((e, i) => {
      //     if (i === 0) {
      //       return {
      //         ...e,
      //         sets: e.sets.map((s, iSet) => {
      //           if (iSet === 0) {
      //             return { ...s, active: true };
      //           }
      //           return s;
      //         }),
      //       };
      //     }
      //     return e;
      //   }),
      // };
      console.log("🚀 ~ useEffect ~ sessionData:", sessionData);

      if (toDay.getTime() !== dataDay.getTime()) {
        sessionData && setSessionShow(sessionData);
        setIsDateNow(false);
      } else {
        sessionData && setSessionShow(sessionData);
        setIsDateNow(true);
      }
    }
  }, [selectedDate, sessionData]);

  useEffect(() => {
    if (templateSelect) {
      console.log("templateSelect", templateSelect);
      useSessionStore.setState(() => ({
        allSessionData: templateSelect.sessions,
      }));

      useSessionStore.setState(() => ({
        sessionData: (() => {
          const foundSession = templateSelect.sessions.find((item) => {
            const toDay = getDateWithoutTime(new Date());
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
  }, [templateSelect]);

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

  const handleFinishSet = (infoSet: InitialState["currentSet"]) => {
    if (!infoSet.active && !infoSet.isDone) return;
    useSessionStore.setState((state) => ({
      currentSet: infoSet,
    }));
    setIsFinishSet(!isFinishSet);
  };

  const handleRest = (infoSet: InitialState["currentSet"]) => {
    doneSet && doneSet(infoSet);
    if (!infoSet.isDone) {
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
                  {sessionShow && (
                    <View className="mb-2 flex items-center justify-center gap-2">
                      <Text className="font-pbold text-xl text-slate-600">
                        {sessionShow && sessionShow.name}
                      </Text>
                      <Text className="font-plight text-[14px] text-slate-600">
                        {`${new Date(sessionShow.date).toLocaleString(
                          "default",
                          { weekday: "short" }
                        )} - ${new Date(sessionShow.date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}`}
                      </Text>
                      <Text className="font-plight text-xl text-slate-600">
                        Time: 04:20
                      </Text>
                    </View>
                  )}
                </View>

                {sessionShow ? (
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
                      session={sessionShow}
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
    </SafeAreaView>
  );
};

export default Session;
