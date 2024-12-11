import { StyleSheet, Text, View } from "react-native";
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
      id: generateRandomNumber(),
      muscleGroup: "Chest",
      name: nameExercise,
      sets: [],
    };

    setExercises([...exercises, exerciseInfo]);
  };

  const generateRandomNumber = () => {
    const min = 1;
    const max = 100;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return String(randomNumber);
  };

  // useEffect(() => {
  //   setExercises([...exercises,])
  // }, []);

  return (
    <View>
      <View className="w-full flex items-center justify-center mt-20 gap-3">
        <Text className="text-2xl font-psemibold">Barbel Bench Press</Text>
        <View className="flex flex-row gap-5 mb-6">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-base">Set</TableHead>
                <TableHead className="text-center text-base">Kg</TableHead>
                <TableHead className="text-center text-base">Reps</TableHead>
                <TableHead className="text-center text-base">Rest</TableHead>
                <TableHead className="text-center text-base">v</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableData className="text-center text-base">1</TableData>
                <TableData className="text-center text-base">60</TableData>
                <TableData className="text-center text-base">12</TableData>
                <TableData className="text-center text-base">60s</TableData>
                <TableData className="text-center text-base">Done</TableData>
              </TableRow>
            </TableBody>
            <TableFooter className="p-2">
              <Button size="xl" variant="solid" action="primary">
                <ButtonText>Add Set</ButtonText>
              </Button>
            </TableFooter>
          </Table>
        </View>

        <View className="mt-[36px] p-2 w-full">
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
            <Button className="mt-3">
              <ButtonText className="flex-1" onPress={handleAddExercise}>
                Add Exercise
              </ButtonText>
            </Button>
          </FormControl>
          <Button className="mt-3 bg-error-400">
            <ButtonText className="flex-1 ">Cancel Template</ButtonText>
          </Button>
        </View>
      </View>
      {/* <Modal
        className="z-[999999]"
        isOpen={true}
        onClose={() => {
          setIsAdd(false);
        }}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader className="flex-col items-start gap-0.5">
            <Heading>Forgot password?</Heading>
            <Text className="text-sm">
              No worries, we’ll send you reset instructions
            </Text>
          </ModalHeader>
          <ModalBody className="mb-4">
            <Input>
              <InputField placeholder="Enter your email" />
            </Input>
          </ModalBody>
          <ModalFooter className="flex-col items-start">
            <Button className="w-full">
              <ButtonText>Submit</ButtonText>
            </Button>
            <Button variant="link" size="sm" className="gap-1">
              <ButtonText>Back to login</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}
    </View>
  );
};

export default CreateExercise;

const styles = StyleSheet.create({});
