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

interface EquipmentInfo {
  name: string;
  img: string;
}

interface Exercise {
  name: string;
  img: string;
  equipment: EquipmentInfo;
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
  const exercises = getAllExercises(exercisesData);
  const muscleGroups = exercisesData.map((exercise) => ({
    name: exercise.muscleGroups,
    img: exercise.img,
  }));
  const equipment = filterEquipment(exercisesData);

  // Add new state variables
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null
  );

  // Add new search state
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Add new filter functions
  const filteredExercises = exercises.filter((exercise) => {
    const matchesMuscle = selectedMuscle
      ? exercisesData.some(
          (group) =>
            group.muscleGroups === selectedMuscle &&
            group.exercises.some((ex) => ex.name === exercise.name)
        )
      : true;

    const matchesEquipment = selectedEquipment
      ? exercise.equipment?.name === selectedEquipment
      : true;

    const matchesSearch = searchTerm
      ? exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchesMuscle && matchesEquipment && matchesSearch;
  });

  const handleMuscleFilter = (muscleName: string) => {
    setSelectedMuscle(selectedMuscle === muscleName ? null : muscleName);
  };

  const handleEquipmentFilter = (equipmentName: string) => {
    setSelectedEquipment(
      selectedEquipment === equipmentName ? null : equipmentName
    );
  };

  // Add search handler
  const handleSearch = (text: string) => {
    setSearchTerm(text);
  };

  function getAllExercises(data: ExercisesInfo[]) {
    try {
      return Object.values(data)
        .flat()
        .reduce((acc: Exercise[], session) => {
          return [...acc, ...session.exercises];
        }, []);
    } catch (error) {
      console.error("Error getting exercises:", error);
      return [];
    }
  }

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

  return (
    <View className="flex-1">
      {/* Header Section - Fixed */}
      <View className="px-2 py-2">
        <View className="w-full flex flex-row justify-between items-center">
          <CloseIconButton onClick={() => onClose()} />
          <Input className="w-[250px]">
            <InputField
              placeholder="Name of exercise"
              value={searchTerm}
              onChangeText={handleSearch}
            />
            <InputSlot>
              <Icon
                as={SearchIcon}
                className="w-5 h-5 mr-2 text-typography-500"
              />
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
      </View>

      {/* Main Scrollable Content */}
      <FlatList
        className="flex-1"
        ListHeaderComponent={() => (
          <>
            {/* Muscle Groups Section */}
            <View className="px-2">
              <Text className="font-psemibold mt-3">Filter by Muscle</Text>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              data={muscleGroups}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`mt-3 mr-3 ${
                    selectedMuscle === item.name ? "opacity-50" : ""
                  }`}
                  onPress={() => handleMuscleFilter(item.name)}
                >
                  <View className="bg-gray-200 w-24 h-24 rounded-lg overflow-hidden">
                    <Image
                      source={{ uri: item.img }}
                      className="w-full h-full"
                    />
                  </View>
                  <Text className="text-center font-psemibold mt-1">
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.name}
            />

            {/* Equipment Section */}
            <View className="px-2">
              <Text className="font-psemibold mt-3">Filter by Equipment</Text>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              data={equipment}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`mt-3 mr-3 ${
                    selectedEquipment === item.name ? "opacity-50" : ""
                  }`}
                  onPress={() => handleEquipmentFilter(item.name)}
                >
                  <View className="bg-gray-200 w-24 h-24 rounded-lg overflow-hidden">
                    <Image
                      source={{ uri: item.img }}
                      className="w-full h-full"
                    />
                  </View>
                  <Text className="w-[100px] text-center font-psemibold mt-1">
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.name}
            />
            <Text className="px-2 font-pbold">{`${filteredExercises.length} exercises`}</Text>
          </>
        )}
        data={filteredExercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <>
            <TouchableOpacity className="flex-row items-center px-2 py-2">
              <Image
                source={{ uri: item.img }}
                className="w-16 h-16 rounded-lg"
              />
              <Text className="ml-4 font-psemibold">{item.name}</Text>
            </TouchableOpacity>
          </>
        )}
        initialNumToRender={10}
        maxToRenderPerBatch={20}
        windowSize={5}
      />
    </View>
  );
};

export default AddExercises;

const styles = StyleSheet.create({});
