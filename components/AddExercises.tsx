import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import PrevIconButton from "./ui/PrevButton";
import { Input, InputField, InputIcon, InputSlot } from "./ui/input";
import { Button, ButtonText } from "./ui/button";
import CloseIconButton from "./ui/CloseButton";
import { CloseIcon, Icon, SearchIcon } from "./ui/icon";
import { supabase } from "@/src/lib/supabaseClient";
import exercisesData from "@/utils/data/exercises.json";

interface AddExercisesProps {
  onClose: () => void;
}

const MUSCLES_GROUP = [
  {
    name: "Chest",
    muscles: ["Chest"],
  },
  {
    name: "Back",
    muscles: ["Back"],
  },
  {
    name: "Shoulders",
    muscles: ["Shoulders"],
  },
  {
    name: "Arms",
    muscles: ["Biceps", "Triceps"],
  },
  {
    name: "Legs",
    muscles: ["Quads", "Hamstrings", "Calves"],
  },
  {
    name: "Abs",
    muscles: ["Abs"],
  },
];

const EQUIPMENT = [
  {
    name: "Dumbbell",
  },
  {
    name: "Barbell",
  },
  {
    name: "Machine",
  },
  {
    name: "Bodyweight",
  },
];

interface EquipmentInfo {
  name: string;
  img: string;
}

interface ExercisesInfo {
  muscleGroups: string;
  img: string;
  totalExercises: number;
  exercises: {
    name: string;
    img: string;
    equipment: EquipmentInfo;
  }[];
}

const AddExercises = ({ onClose }: AddExercisesProps) => {
  //   const [exerciseInfo, setExerciseInfo] =
  // useState<ExercisesInfo[]>(exercisesData);
  const muscleGroups = exercisesData.map((exercise) => ({
    name: exercise.muscleGroups,
    img: exercise.img,
  }));
  const equipment = filterEquipment(exercisesData);

  function filterEquipment(exercisesData: ExercisesInfo[]) {
    // Create a Set to store unique equipment names
    // const equipmentSet = new Set();
    const equipmentSet: EquipmentInfo[] = [];

    // Loop through all muscle groups
    exercisesData.forEach((muscleGroup) => {
      // Loop through exercises in each muscle group
      muscleGroup.exercises.forEach((exercise) => {
        // Check if exercise has equipment and equipment has img property
        if (exercise.equipment && exercise.equipment.img) {
          // Extract equipment name from the image URL
          const hasMatch = equipmentSet.some(
            (item) =>
              item.name === exercise.equipment.name &&
              item.img === exercise.equipment.img
          );
          if (!hasMatch) {
            equipmentSet.push({
              name: exercise.equipment.name,
              img: exercise.equipment.img,
            });
          }
        }
      });
    });

    return equipmentSet;
  }

  console.log("equipment", equipment);

  return (
    <ScrollView>
      <View className="w-full mt-2 flex flex-row justify-between">
        <CloseIconButton onClick={() => onClose()} />
        <Input className="w-[250px]">
          <InputField
            className=""
            placeholder="Name of exercise"
            //   value={templateData.name}
            //   onChangeText={(text) => handleSetTemplateName(text)}
          />
          <InputSlot>
            {/* <InputIcon> */}
            <Icon
              as={SearchIcon}
              className="w-5 h-5 mr-2 text-typography-500"
            />
            {/* </InputIcon> */}
          </InputSlot>
        </Input>
        <Button
          className="bg-success-300 focus:bg-success-50"
          // onPress={handleSaveTemplate}
          // isDisabled={isLoading}
        >
          <ButtonText>Add</ButtonText>
        </Button>
      </View>
      <Text className="font-psemibold mt-3">Filter by Muscle</Text>
      <FlatList
        horizontal={true}
        data={muscleGroups}
        renderItem={({ item }) => (
          <TouchableOpacity className="mt-3 mr-1" onPress={() => {}}>
            <View className="bg-gray-200 w-24 h-24 rounded-lg flex items-center justify-center border ml-2">
              <Image
                source={{ uri: item.img }}
                className="w-full h-full rounded-lg"
              />
            </View>
            <Text className="text-center font-psemibold">{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.name}
      />
      <Text className="font-psemibold mt-3">Filter by Equipment</Text>
      <FlatList
        horizontal={true}
        data={equipment}
        renderItem={({ item }) => (
          <TouchableOpacity className="mt-3 mr-1" onPress={() => {}}>
            <View className="bg-gray-200 w-24 h-24 rounded-lg flex items-center justify-center border ml-2">
              <Image
                source={{ uri: item.img }}
                className="w-full h-full rounded-lg"
              />
            </View>
            <Text className="w-[100px] text-center font-psemibold">
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.name}
      />
    </ScrollView>
  );
};

export default AddExercises;

const styles = StyleSheet.create({});
