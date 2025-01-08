import {
  Alert,
  findNodeHandle,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputChangeEventData,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  TableHeader,
  TableFooter,
  TableBody,
  TableHead,
  TableData,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Exercise, SessionData, Set, Template } from "@/types/session";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { Input, InputField } from "./ui/input";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "./ui/form-control";
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";
import CloseIconButton from "./ui/CloseButton";
import { Agenda, Calendar, DateData } from "react-native-calendars";
import { useStore } from "@/store/useTemplateStore";
import { clear } from "@/utils/AsyncStorage";
import { set, addDays, getDay } from "date-fns";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "./ui/alert-dialog";
import { Heading } from "./ui/heading";
import PrevIconButton from "./ui/PrevButton";
import { useRouter } from "expo-router";
import { supabase } from "@/src/lib/supabaseClient";
import { templateService } from "@/src/lib/services/templateService";
import { getDateWithoutTime } from "@/utils/dateHelpers";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "./ui/actionsheet";
import AddExercises from "./AddExercises";
import { color } from "@rneui/base";

interface infoSetsForm {
  id: string;
  set: string;
  weight: number;
  reps: number;
  resTime: number;
}

interface CreateExerciseProps {
  onClose: () => void;
  templateSelect?: Template | null;
}

interface RepeatOption {
  enabled: boolean;
  daysToRepeat: number[];
  endDate?: string;
}

// clear();

const CreateExercise = ({ onClose, templateSelect }: CreateExerciseProps) => {
  const router = useRouter();
  const [session, setSession] = useState<SessionData[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [nameExerciseInput, setnameExerciseInput] = useState("");
  const [templateInput, setTemplateInput] = useState("");
  const [sessionNameInput, setSessionNameInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false); // [showAlertDialog]
  const [idExerciseDelete, setIdExerciseDelete] = useState<string[]>([]);
  const [isAddExerciseModalVisible, setIsAddExerciseModalVisible] =
    useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const addTemplate = useStore((state) => state.addTemplate);
  // const saveTemplate = useStore((state) => state.saveTemplate);

  const [templateData, setTemplateData] = useState<Template>({
    id: "",
    created_at: new Date().toISOString(),
    name: "",
    sessions: [],
  });

  const [repeatOptions, setRepeatOptions] = useState<RepeatOption>({
    enabled: false,
    daysToRepeat: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = useStore((state) => state.fetchTemplates);

  useEffect(() => {
    // Set the initial selected date to today
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (templateSelect) {
      setTemplateData(templateSelect);
    }
  }, [templateSelect]);

  useEffect(() => {
    if (templateData) {
      const dataByDate = templateData.sessions.filter(
        (session) => session.date === selectedDate
      )[0];
      dataByDate?.exercises && setExercises(dataByDate.exercises);
      dataByDate?.name && setSessionNameInput(dataByDate.name);

      setRepeatOptions({
        enabled: false,
        daysToRepeat: [],
      });

      if (dataByDate) {
        setIsSaved(true);
      } else {
        setExercises([]);
      }
    }
  }, [selectedDate, sessionNameInput]);

  useEffect(() => {
    let templateDataInsert;

    if (exercises.length > 0) {
      const idSession =
        templateSelect &&
        templateSelect.sessions.find(
          (session) =>
            getDateWithoutTime(new Date(session.date)).getTime() ===
            getDateWithoutTime(new Date(selectedDate)).getTime()
        )?.id;

      const newSession: SessionData = {
        ...(idSession && { id: idSession }),
        date: selectedDate,
        name: sessionNameInput.trim(),
        exercises: exercises,
      };
      const repeatedSessions = generateRepeatedSessions(newSession);
      // Update template data with all sessions
      templateDataInsert = {
        ...templateData,
        sessions: [
          ...templateData.sessions.filter(
            (s) => !repeatedSessions.some((rs) => rs.date === s.date)
          ),
          ...repeatedSessions,
        ],
      };

      setTemplateData(templateDataInsert);
    }
  }, [exercises, repeatOptions]);

  const handleSetTemplateName = (name: string) => {
    setTemplateData({ ...templateData, name: name });
  };

  const handleAddExercise = (exerciseNames: string[]) => {
    if (exerciseNames.length === 0) {
      Alert.alert("Error", "Please enter at least one exercise.");
      return;
    }

    const exerciseInfo = exerciseNames.map((exercise, index) => {
      return {
        id: uuidv4(),
        name: exercise,
        sets: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        exerciseOrder: String(index + index),
      };
    });

    setIsAddExerciseModalVisible(false);

    setExercises((prevExercises) => [...prevExercises, ...exerciseInfo]);
  };

  const handleAddSets = (idExercise: string) => {
    if (exercises) {
      const addSets = exercises.map((exercise) => {
        if (exercise.id === idExercise) {
          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: uuidv4(),
                setOrder: String(exercise.sets.length + 1),
                reps: null,
                weight: null,
                restTime: null,
              },
            ],
          };
        }

        return { ...exercise };
      });

      setExercises(addSets);
    }
  };

  const infoSetInit: Record<string, any> = {};

  const handleSetChange = (text: string, type: string, idSet: string) => {
    infoSetInit[type] = text;
    infoSetInit["id"] = idSet;

    if (exercises) {
      const saveSets = exercises.map((exercise) => {
        const updateSet = exercise.sets.map((set) => {
          if (set.id === infoSetInit.id) {
            return { ...set, ...infoSetInit };
          }
          return { ...set };
        });
        return { ...exercise, sets: updateSet };
      });

      setExercises(saveSets);
    }
  };

  const handleDeleteExercise = (idExercise: string) => {
    const deleteExercise = exercises.filter(
      (exercise) => exercise.id !== idExercise
    );
    setIdExerciseDelete([...idExerciseDelete, idExercise]);
    setExercises(deleteExercise);
  };

  const generateRepeatedSessions = (
    baseSession: SessionData
  ): SessionData[] => {
    if (!repeatOptions.enabled || repeatOptions.daysToRepeat.length === 0) {
      return [baseSession];
    }

    const sessions: SessionData[] = [baseSession];
    const startDate = new Date(baseSession.date);
    const endDate = repeatOptions.endDate
      ? new Date(repeatOptions.endDate)
      : addDays(startDate, 90); // Default to 90 days if no end date

    let currentDate = addDays(startDate, 1);

    while (currentDate <= endDate) {
      const dayOfWeek = getDay(currentDate);
      if (repeatOptions.daysToRepeat.includes(dayOfWeek)) {
        sessions.push({
          ...baseSession,
          id: uuidv4(),
          date: currentDate.toISOString().split("T")[0],
        });
      }
      currentDate = addDays(currentDate, 1);
    }

    return sessions;
  };

  const handleChangeDate = (date: DateData) => {
    setIsSaved(false);
    setSessionNameInput("");
    // setExercises([]);
    setSelectedDate(date.dateString);
    setIsCalendarVisible(!isCalendarVisible);
  };

  const handleSaveTemplate = async () => {
    if (!sessionNameInput.trim()) {
      Alert.alert("Error", "Please enter a session name");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert("Error", "Please add at least one exercise");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    // let templateDataInsert;

    // if (exercises.length > 0) {
    //   const idSession =
    //     templateSelect &&
    //     templateSelect.sessions.find(
    //       (session) =>
    //         getDateWithoutTime(new Date(session.date)).getTime() ===
    //         getDateWithoutTime(new Date()).getTime()
    //     )?.id;
    //   const newSession: SessionData = {
    //     ...(idSession && { id: idSession }),
    //     date: selectedDate,
    //     name: sessionNameInput.trim(),
    //     exercises: exercises,
    //   };
    //   const repeatedSessions = generateRepeatedSessions(newSession);
    //   // Update template data with all sessions
    //   templateDataInsert = {
    //     ...templateData,
    //     sessions: [
    //       ...templateData.sessions.filter(
    //         (s) => !repeatedSessions.some((rs) => rs.date === s.date)
    //       ),
    //       ...repeatedSessions,
    //     ],
    //   };
    // }

    try {
      setIsLoading(true);

      if (idExerciseDelete.length > 0) {
        await templateService.deleteExercises(idExerciseDelete);
      }

      if (templateData) {
        if (templateSelect) {
          await templateService.updateFullTemplate(
            templateSelect.id,
            templateData,
            user.id
          );
        } else {
          await templateService.createFullTemplate(templateData, user.id);
        }
      }

      await fetchTemplates();

      Alert.alert("Success", "Template saved successfully!");
      onClose();
      router.back();
    } catch (error) {
      console.error("Error saving template:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to save template. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <View className="h-full">
        <View className="w-ful mt-2 flex flex-row justify-between">
          <PrevIconButton
            onClick={() => {
              router.back();
            }}
          />
          <Input className="w-[250px]">
            <InputField
              className="text-center"
              placeholder="Template Name"
              value={templateData.name}
              onChangeText={(text) => handleSetTemplateName(text)}
            />
          </Input>
          <Button
            className="bg-zinc-50 focus:bg-success-50"
            onPress={handleSaveTemplate}
            isDisabled={isLoading}
          >
            <ButtonText className="text-zinc-800 font-psemibold">
              {isLoading ? "Saving..." : "Save"}
            </ButtonText>
          </Button>
        </View>
        <View className="w-full mt-2">
          <View className="flex flex-row">
            <View className="w-full">
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="font-psemibold text-zinc-50">
                    Session Name
                  </FormControlLabelText>
                </FormControlLabel>
                <Input className="w-full">
                  <InputField
                    placeholder="Session Name"
                    value={sessionNameInput}
                    onChangeText={(text) => setSessionNameInput(text)}
                  />
                </Input>
              </FormControl>
            </View>
          </View>
        </View>
        <View className="mt-3">
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText className="font-psemibold text-zinc-50">
                Repeat Session
              </FormControlLabelText>
            </FormControlLabel>
            <View className="flex-row items-center">
              <Button
                // variant={repeatOptions.enabled ? "solid" : "outline"}
                onPress={() =>
                  setRepeatOptions((prev) => ({
                    ...prev,
                    enabled: !prev.enabled,
                  }))
                }
                className={`mr-2 ${
                  repeatOptions.enabled ? "bg-zinc-50" : "bg-zinc-800"
                }`}
              >
                <ButtonText
                  className={`font-psemibold ${
                    repeatOptions.enabled ? "text-zinc-800" : "text-zinc-50"
                  }`}
                >
                  {repeatOptions.enabled ? "Repeat On" : "Repeat Off"}
                </ButtonText>
              </Button>
            </View>
            {repeatOptions.enabled && (
              <View className="mt-2">
                <Text className="mb-2 font-psemibold">Repeat on:</Text>
                <View className="flex-row flex-wrap gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day, index) => (
                      <Button
                        key={day}
                        // variant={
                        //   repeatOptions.daysToRepeat.includes(index)
                        //     ? "solid"
                        //     : "outline"
                        // }
                        onPress={() => {
                          setRepeatOptions((prev) => ({
                            ...prev,
                            daysToRepeat: prev.daysToRepeat.includes(index)
                              ? prev.daysToRepeat.filter((d) => d !== index)
                              : [...prev.daysToRepeat, index],
                          }));
                        }}
                        className={`${
                          repeatOptions.daysToRepeat.includes(index)
                            ? "bg-zinc-50"
                            : "bg-zinc-800"
                        }`}
                      >
                        <ButtonText
                          className={`${
                            repeatOptions.daysToRepeat.includes(index)
                              ? "text-zinc-800"
                              : "text-zinc-50"
                          }`}
                        >
                          {day}
                        </ButtonText>
                      </Button>
                    )
                  )}
                </View>
              </View>
            )}
          </FormControl>
        </View>
        <View className="mt-3">
          <Text className="mb-2 font-psemibold text-zinc-50">Day Workout</Text>
          <Button
            action="primary"
            onPress={() => setIsCalendarVisible(!isCalendarVisible)}
            className="bg-zinc-50"
          >
            <ButtonText className="text-zinc-800">{selectedDate}</ButtonText>
          </Button>
          {isCalendarVisible && (
            <Calendar
              // Mark the selected date
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  marked: true,
                  selectedColor: "#fafafa",
                  selectedTextColor: "#27272a",
                  dotColor: "#27272a",
                },
              }}
              current={selectedDate}
              // Event handler for selecting a day
              onDayPress={handleChangeDate}
              theme={{
                // Background colors
                backgroundColor: "#121212",
                calendarBackground: "#121212",

                // Header styling
                textSectionTitleColor: "#ffffff",
                textSectionTitleDisabledColor: "#666666",
                selectedDayBackgroundColor: "#2196F3", // Blue circle for selected date
                selectedDayTextColor: "#ffffff",
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

                // Custom header style
                "stylesheet.calendar.header": {
                  header: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingLeft: 10,
                    paddingRight: 10,
                    marginTop: 6,
                    alignItems: "center",
                  },
                  monthText: {
                    fontSize: 20,
                    fontWeight: "300",
                    color: "#808080",
                  },
                  dayHeader: {
                    marginTop: 2,
                    marginBottom: 7,
                    width: 32,
                    textAlign: "center",
                    fontSize: 14,
                    color: "#ffffff",
                  },
                },
              }}
            />
          )}
        </View>

        <View className="mt-3 ">
          <Button
            className="mt-3 bg-zinc-50 w-full"
            size="md"
            variant="solid"
            action="primary"
            onPress={() => setIsAddExerciseModalVisible(true)}
          >
            <ButtonText className="text-zinc-800">Add Exercise</ButtonText>
          </Button>
        </View>
        <KeyboardAwareScrollView bottomOffset={50} className="mt-3">
          {exercises &&
            exercises.map((exercise) => (
              <View key={exercise.id}>
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-base font-psemibold text-zinc-50">
                    {exercise.name}
                  </Text>
                  <CloseIconButton
                    onClick={() => handleDeleteExercise(exercise.id)}
                  />
                </View>
                <View className="flex flex-row gap-5 mb-6">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-zinc-800">
                        <TableHead className="text-center text-base text-zinc-50">
                          Set
                        </TableHead>
                        <TableHead className="text-center text-base text-zinc-50">
                          Kg
                        </TableHead>
                        <TableHead className="text-center text-base text-zinc-50">
                          Reps
                        </TableHead>
                        <TableHead className="text-center text-base text-zinc-50">
                          Rest
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercise.sets &&
                        exercise.sets
                          .sort(
                            (a, b) => Number(a.setOrder) - Number(b.setOrder)
                          )
                          .map((set, iSet) => (
                            <TableRow key={set.id} className="bg-zinc-900">
                              <TableData className="text-center text-base text-zinc-50">
                                {iSet + 1}
                              </TableData>
                              <TableData
                                useRNView={true}
                                className="flex flex-row justify-center items-center"
                              >
                                <Input
                                  className={`px-1 h-6 w-[50px]`}
                                  variant="outline"
                                  size="md"
                                  isDisabled={false}
                                  isInvalid={false}
                                >
                                  <InputField
                                    value={set.weight ? String(set.weight) : ""}
                                    onChangeText={(text) =>
                                      handleSetChange(text, "weight", set.id)
                                    }
                                    placeholder="60"
                                  />
                                </Input>
                              </TableData>
                              <TableData
                                useRNView={true}
                                className="flex flex-row justify-center items-center"
                              >
                                <Input
                                  className={`px-1 h-6 w-[50px]`}
                                  variant="outline"
                                  size="md"
                                  isDisabled={false}
                                  isInvalid={false}
                                >
                                  <InputField
                                    value={set.reps ? String(set.reps) : ""}
                                    onChangeText={(text) =>
                                      handleSetChange(text, "reps", set.id)
                                    }
                                    placeholder="12"
                                  />
                                </Input>
                              </TableData>
                              <TableData
                                useRNView={true}
                                className="flex flex-row justify-center items-center"
                              >
                                <Input
                                  className={`px-1 h-6 w-[50px]`}
                                  variant="outline"
                                  size="md"
                                >
                                  <InputField
                                    value={
                                      set.rest_time ? String(set.rest_time) : ""
                                    }
                                    onChangeText={(text) =>
                                      handleSetChange(text, "rest_time", set.id)
                                    }
                                    placeholder="60"
                                  />
                                </Input>
                              </TableData>
                            </TableRow>
                          ))}
                    </TableBody>
                    <TableFooter>
                      <Button
                        className="mt-3"
                        size="md"
                        variant="solid"
                        action="primary"
                        onPress={() => handleAddSets(exercise.id)}
                      >
                        <ButtonText>Add sets</ButtonText>
                      </Button>
                    </TableFooter>
                  </Table>
                </View>
              </View>
            ))}
        </KeyboardAwareScrollView>
      </View>
      <AlertDialog
        isOpen={showAlertDialog}
        onClose={() => setShowAlertDialog(!showAlertDialog)}
        size="md"
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading className="text-typography-950 font-semibold" size="md">
              Are you sure you want to delete this post?
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-3 mb-4">
            <Text className="mb-2 font-psemibold text-typography-900">
              Deleting the post will remove it permanently and cannot be undone.
              Please confirm if you want to proceed.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="">
            <Button
              variant="outline"
              action="secondary"
              onPress={() => setShowAlertDialog(!showAlertDialog)}
              size="sm"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              onPress={() => setShowAlertDialog(!showAlertDialog)}
            >
              <ButtonText>Delete</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Actionsheet
          useRNModal={true}
          snapPoints={[90]}
          isOpen={isAddExerciseModalVisible}
          onClose={() => setIsAddExerciseModalVisible(false)}
        >
          <ActionsheetBackdrop />
          <ActionsheetContent className="p-2 bg-zinc-900 border border-zinc-700">
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            {/* <CreateExercise
              templateSelect={templateSelect}
              onClose={handleOnCloseCreateModal}
            /> */}
            <AddExercises
              onAddExercises={(exercises) =>
                handleAddExercise(exercises.map((e) => e.name))
              }
              onClose={() => {
                setIsAddExerciseModalVisible(false);
              }}
            />
          </ActionsheetContent>
        </Actionsheet>
      </KeyboardAvoidingView>

      {isLoading && (
        <View
          style={StyleSheet.absoluteFill}
          className="bg-black/30 items-center justify-center"
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
};

export default CreateExercise;

const styles = StyleSheet.create({});
