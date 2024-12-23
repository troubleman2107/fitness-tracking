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
  console.log("🚀 ~ CreateExercise ~ exercises:", exercises);

  const [nameExerciseInput, setnameExerciseInput] = useState("");
  const [templateInput, setTemplateInput] = useState("");
  const [sessionNameInput, setSessionNameInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false); // [showAlertDialog]

  const [isSaved, setIsSaved] = useState(false);
  const addTemplate = useStore((state) => state.addTemplate);
  // const saveTemplate = useStore((state) => state.saveTemplate);

  const [templateData, setTemplateData] = useState<Template>({
    id: "",
    createDate: new Date().toISOString(),
    name: "",
    sessions: [],
  });
  console.log("🚀 ~ CreateExercise ~ templateData:", templateData);

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
      if (dataByDate) {
        setSessionNameInput(dataByDate?.name);
        setExercises(dataByDate?.exercises);
      }
    }
  }, [templateData]);

  useEffect(() => {
    if (templateData) {
      const dataByDate = templateData.sessions.filter(
        (session) => session.date === selectedDate
      )[0];
      dataByDate?.exercises && setExercises(dataByDate.exercises);
      dataByDate?.name && setSessionNameInput(dataByDate.name);

      if (dataByDate) {
        setIsSaved(true);
      } else {
        setExercises([]);
      }
    }
  }, [selectedDate]);

  const handleSetTemplateName = (name: string) => {
    setTemplateData({ ...templateData, name: name });
  };

  const handleAddExercise = () => {
    if (!nameExerciseInput) {
      Alert.alert("Error", "Please enter a exercise name");
      return;
    }

    const exerciseInfo: Exercise = {
      id: uuidv4(),
      name: nameExerciseInput,
      sets: [],
    };
    setExercises([...exercises, exerciseInfo]);
    setnameExerciseInput("");
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

    setExercises(deleteExercise);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  const handleOnSaveSession = () => {
    setIsSaved(true);

    const newSession: SessionData = {
      id: uuidv4(),
      date: selectedDate,
      name: sessionNameInput.trim(),
      exercises: exercises,
    };

    const repeatedSessions = generateRepeatedSessions(newSession);

    // Update template data with all sessions
    setTemplateData({
      ...templateData,
      sessions: [
        ...templateData.sessions.filter(
          (s) => !repeatedSessions.some((rs) => rs.date === s.date)
        ),
        ...repeatedSessions,
      ],
    });
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

    try {
      setIsLoading(true);

      await templateService.saveFullTemplate(templateData, user.id);

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

  const handleRequiredInput = () => {
    if (!sessionNameInput.trim()) {
      Alert.alert("Error", "Please enter a session name");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert("Error", "Please add at least one exercise");
      return;
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
            className="bg-success-300 focus:bg-success-50"
            onPress={handleSaveTemplate}
            isDisabled={isLoading}
          >
            <ButtonText>{isLoading ? "Saving..." : "Save"}</ButtonText>
          </Button>
        </View>
        <View className="w-full mt-2">
          <View className="flex flex-row">
            <View className="w-full">
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="font-psemibold">
                    Session Name
                  </FormControlLabelText>
                </FormControlLabel>
                <Input className="w-full" isReadOnly={isSaved}>
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
              <FormControlLabelText className="font-psemibold">
                Repeat Session
              </FormControlLabelText>
            </FormControlLabel>
            <View className="flex-row items-center">
              <Button
                variant={repeatOptions.enabled ? "solid" : "outline"}
                onPress={() =>
                  setRepeatOptions((prev) => ({
                    ...prev,
                    enabled: !prev.enabled,
                  }))
                }
                className="mr-2"
              >
                <ButtonText>
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
                        variant={
                          repeatOptions.daysToRepeat.includes(index)
                            ? "solid"
                            : "outline"
                        }
                        onPress={() => {
                          setRepeatOptions((prev) => ({
                            ...prev,
                            daysToRepeat: prev.daysToRepeat.includes(index)
                              ? prev.daysToRepeat.filter((d) => d !== index)
                              : [...prev.daysToRepeat, index],
                          }));
                        }}
                      >
                        <ButtonText>{day}</ButtonText>
                      </Button>
                    )
                  )}
                </View>
              </View>
            )}
          </FormControl>
        </View>
        <View className="mt-3">
          <Text className="mb-2 font-psemibold text-typography-900">
            Day Workout
          </Text>
          <Button
            action="primary"
            onPress={() => setIsCalendarVisible(!isCalendarVisible)}
          >
            <ButtonText>{selectedDate}</ButtonText>
          </Button>
          {isCalendarVisible && (
            <Calendar
              // Mark the selected date
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  marked: true,
                },
              }}
              current={selectedDate}
              // Event handler for selecting a day
              onDayPress={handleChangeDate}
            />
          )}
        </View>

        <View className="mt-3">
          <FormControl className="w-full">
            <FormControlLabel>
              <FormControlLabelText className="font-psemibold">
                Name of Exercise
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="w-full">
              <InputField
                placeholder="Barbel Bench Press"
                value={nameExerciseInput}
                onChangeText={(text) => setnameExerciseInput(text)}
              />
            </Input>
            <Button
              className="mt-3 w-full"
              size="md"
              variant="solid"
              action="primary"
              onPress={handleAddExercise}
            >
              <ButtonText>Add Exercise</ButtonText>
            </Button>
          </FormControl>
        </View>
        <KeyboardAwareScrollView bottomOffset={50} className="mt-3">
          {exercises &&
            exercises.map((exercise) => (
              <View key={exercise.id}>
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-base font-psemibold">
                    {exercise.name}
                  </Text>
                  <CloseIconButton
                    onClick={() => handleDeleteExercise(exercise.id)}
                  />
                </View>
                <View className="flex flex-row gap-5 mb-6">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center text-base">
                          Set
                        </TableHead>
                        <TableHead className="text-center text-base">
                          Kg
                        </TableHead>
                        <TableHead className="text-center text-base">
                          Reps
                        </TableHead>
                        <TableHead className="text-center text-base">
                          Rest
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercise.sets &&
                        exercise.sets.map((set, iSet) => (
                          <TableRow key={set.id}>
                            <TableData className="text-center text-base">
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
                                isReadOnly={isSaved}
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
                                isReadOnly={isSaved}
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
                                isReadOnly={isSaved}
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
          {!isSaved ? (
            <Button
              className="bg-success-300"
              size="md"
              variant="solid"
              action="primary"
              onPress={handleOnSaveSession}
            >
              <ButtonText>Save Session</ButtonText>
            </Button>
          ) : (
            <Button
              className="bg-success-300"
              size="md"
              variant="solid"
              action="primary"
              onPress={() => setIsSaved(false)}
            >
              <ButtonText>Edit Session</ButtonText>
            </Button>
          )}
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
