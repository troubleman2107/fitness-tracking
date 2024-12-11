import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "./CustomButton";
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
import { Exercise } from "@/types/session";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { Input, InputField } from "./ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "./ui/modal";
import { Heading } from "./ui/heading";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "./ui/form-control";

const EXERCISES_DATA = [
  {
    name: "Bench Press",
  },
  {
    name: "Lat Pulldown",
  },
];

const CreateExercise = () => {
  const [isAdd, setIsAdd] = useState(false);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [nameExercise, setNameExercise] = useState("");

  console.log("🚀 ~ CreateExercise ~ exercises:", exercises);

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
          exercise.sets.push({
            id: uuidv4(),
            reps: null,
            weight: null,
            restTime: null,
          });
        }

        return exercise;
      });

      setExercises(addSets);
    }
  };

  // useEffect(() => {
  //   setExercises([...exercises,])
  // }, []);

  return (
    <ScrollView>
      <View className="w-full flex items-center justify-center mt-20 gap-3">
        {exercises &&
          exercises.map((exercise, iExercise) => (
            <View key={iExercise}>
              <Text className="text-xl font-psemibold">{exercise.name}</Text>
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
                      <TableHead className="text-center text-base">v</TableHead>
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
                              className={`px-1 h-6 w-[50px]`}
                              variant="outline"
                              size="md"
                              isDisabled={false}
                              isInvalid={false}
                              isReadOnly={false}
                            >
                              <InputField placeholder="60" />
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
                              <InputField placeholder="12" />
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
                              <InputField placeholder="60" />
                            </Input>
                          </TableData>
                          <TableData className="text-center text-base">
                            Done
                          </TableData>
                        </TableRow>
                      ))}
                  </TableBody>
                  <TableFooter className="p-2">
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
        <View className="mt-[36px] p-2 flex flex-row ">
          <View className="w-full">
            <FormControl className="w-full">
              <FormControlLabel>
                <FormControlLabelText>Name of Exercise</FormControlLabelText>
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
            <Button
              className="bg-error-400 mt-2 w-full"
              size="md"
              variant="solid"
              action="primary"
              onPress={handleAddExercise}
            >
              <ButtonText>Cancel Template</ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateExercise;

const styles = StyleSheet.create({});
