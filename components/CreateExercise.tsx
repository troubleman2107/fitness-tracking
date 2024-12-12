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
import { Exercise, Set } from "@/types/session";
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

interface infoSetsForm {
  id: string;
  set: string;
  weight: number;
  reps: number;
  resTime: number;
}

const CreateExercise = () => {
  const [isAdd, setIsAdd] = useState(false);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [nameExercise, setNameExercise] = useState("");
  const keyRef = useRef(null);
  const weightRef = useRef(null);

  const handleAddExercise = () => {
    const exerciseInfo: Exercise = {
      id: uuidv4(),
      muscleGroup: "Chest",
      name: nameExercise,
      sets: [],
    };

    setExercises([...exercises, exerciseInfo]);
    setNameExercise("");
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

  return (
    <View className="flex-1">
      <View className="w-full mb-6">
        <View className="p-2 flex flex-row">
          <View className="w-full">
            <FormControl className="w-full">
              <FormControlLabel>
                <FormControlLabelText className="font-psemibold">
                  Name of Exercise
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="w-full">
                <InputField
                  placeholder="Barbel Bench Press"
                  value={nameExercise}
                  onChangeText={(text) => setNameExercise(text)}
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
        </View>
      </View>
      <KeyboardAwareScrollView bottomOffset={50}>
        {exercises &&
          exercises.map((exercise, iExercise) => (
            <View key={iExercise}>
              <Text className="text-base font-psemibold">{exercise.name}</Text>
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
                        <TableRow key={iSet}>
                          <TableData className="text-center text-base">
                            {iSet + 1}
                          </TableData>
                          <TableData
                            useRNView={true}
                            className="flex flex-row justify-center items-center"
                          >
                            <Input
                              ref={weightRef}
                              className={`px-1 h-6 w-[50px]`}
                              variant="outline"
                              size="md"
                              isDisabled={false}
                              isInvalid={false}
                              isReadOnly={false}
                            >
                              <InputField
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
                              isReadOnly={false}
                            >
                              <InputField
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
                                onChangeText={(text) =>
                                  handleSetChange(text, "restTime", set.id)
                                }
                                placeholder="60"
                              />
                            </Input>
                          </TableData>
                        </TableRow>
                      ))}
                  </TableBody>
                  <TableFooter className="p-2 mb-3">
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
  );
};

export default CreateExercise;

const styles = StyleSheet.create({});
