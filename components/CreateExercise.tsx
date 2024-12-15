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
import { Agenda, DateData } from "react-native-calendars";
import { useStore } from "@/store/useTemplateStore";
import { clear } from "@/utils/AsyncStorage";

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

// clear();

const CreateExercise = ({ onClose, templateSelect }: CreateExerciseProps) => {
  const [session, setSession] = useState<SessionData[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [nameExerciseInput, setnameExerciseInput] = useState("");
  const [templateInput, setTemplateInput] = useState("");
  const [sessionNameInput, setSessionNameInput] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSaved, setIsSaved] = useState(false);
  const addTemplate = useStore((state) => state.addTemplate);

  const [templateData, setTemplateData] = useState<Template>({
    id: "",
    createDate: new Date().toISOString(),
    name: "",
    sessions: [],
  });

  const handleSetTemplateName = (name: string) => {
    setTemplateData({ ...templateData, name: name });
  };

  useEffect(() => {
    if (templateData) {
      const dataByDate = templateData.sessions.filter(
        (session) => session.date === formatDate(selectedDate)
      )[0];
      dataByDate?.exercises && setExercises(dataByDate.exercises);
      dataByDate?.name && setSessionNameInput(dataByDate.name);
    }
  }, [selectedDate]);

  //Handle save template
  // useEffect(() => {
  //   if (session.length > 0) {
  //     const idTemplate = uuidv4();
  //     const nameTemplate = templateInput;
  //     const createdDate = new Date().toISOString();

  //     addTemplate({
  //       id: idTemplate,
  //       name: nameTemplate,
  //       createDate: createdDate,
  //       sessions: session,
  //     });

  //     console.log("session", session);
  //   }
  // }, [session]);

  // useEffect(() => {
  //   setSession([
  //     ...session,
  //     {
  //       id: uuidv4(),
  //       date: formatDate(selectedDate),
  //       name: "",
  //       exercises: [],
  //     },
  //   ]);
  // }, []);

  const handleAddExercise = () => {
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

  const handleOnSaveSession = () => {
    if (!sessionNameInput.trim()) {
      Alert.alert("Error", "Please enter a session name");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert("Error", "Please add at least one exercise");
      return;
    }

    const newSession: SessionData = {
      id: uuidv4(),
      date: formatDate(selectedDate),
      name: sessionNameInput.trim(),
      exercises: exercises,
    };

    setTemplateData({
      ...templateData,
      sessions: [...templateData.sessions, newSession],
    });

    // setSession((prevSessions) => [...prevSessions, newSession]);
    // setExercises([]);
    setIsSaved(true);
    // onClose();
  };

  const handleChangeDate = (date: DateData) => {
    setSelectedDate(new Date(date.dateString));
    setIsSaved(false);
    setExercises([]);
  };

  return (
    <View className="p-2 flex-1 pt-14">
      <View className="w-ful flex flex-row justify-between">
        <CloseIconButton onClick={onClose} />
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
          onPress={handleOnSaveSession}
        >
          <ButtonText>Save</ButtonText>
        </Button>
      </View>
      <View className="w-full mb-6 mt-5">
        <View className="flex flex-row">
          <View className="w-full">
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="font-psemibold">
                  Session Name
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="w-full mb-3">
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
      <Text className="font-psemibold text-typography-900">Day Workout</Text>
      <Agenda
        style={{ backgroundColor: "#000" }}
        contentContainerStyle={{ backgroundColor: "#000" }}
        onDayPress={(date: DateData) => handleChangeDate(date)}
        items={{ items: [] }}
        renderEmptyData={() => {
          return (
            <View className=" h-full bg-white">
              <View className="mb-6">
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
              <KeyboardAwareScrollView bottomOffset={50}>
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
                                        value={
                                          set.weight ? String(set.weight) : ""
                                        }
                                        onChangeText={(text) =>
                                          handleSetChange(
                                            text,
                                            "weight",
                                            set.id
                                          )
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
                                          set.restTime
                                            ? String(set.restTime)
                                            : ""
                                        }
                                        onChangeText={(text) =>
                                          handleSetChange(
                                            text,
                                            "restTime",
                                            set.id
                                          )
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
                    className="mt-3 bg-success-300"
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
          );
        }}
      ></Agenda>
    </View>
  );
};

export default CreateExercise;

const styles = StyleSheet.create({});
