import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState, useRef, useMemo } from "react";
import PrevIconButton from "./ui/PrevButton";
import { Input, InputField, InputIcon, InputSlot } from "./ui/input";
import { Button, ButtonText } from "./ui/button";
import CloseIconButton from "./ui/CloseButton";
import { CloseIcon, Icon, SearchIcon } from "./ui/icon";
import { supabase } from "@/src/lib/supabaseClient";
import exercisesData from "@/utils/data/exercises.json";

interface AddExercisesProps {
  onClose: () => void;
  onAddExercises: (exercises: Exercise[]) => void;
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

// Separate Header Component
const ListHeader = React.memo(
  ({
    muscleGroups,
    equipment,
    selectedMuscle,
    selectedEquipment,
    handleMuscleFilter,
    handleEquipmentFilter,
    filteredExercisesCount,
  }: {
    muscleGroups: { name: string; img: string }[];
    equipment: EquipmentInfo[];
    selectedMuscle: string | null;
    selectedEquipment: string | null;
    handleMuscleFilter: (name: string) => void;
    handleEquipmentFilter: (name: string) => void;
    filteredExercisesCount: number;
  }) => {
    const muscleGroupsListRef = useRef(null);
    const equipmentListRef = useRef(null);

    return (
      <>
        {/* Muscle Groups Section */}
        <View className="px-2">
          <Text className="font-psemibold mt-3">Filter by Muscle</Text>
        </View>
        <FlatList
          ref={muscleGroupsListRef}
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
                <Image source={{ uri: item.img }} className="w-full h-full" />
              </View>
              <Text className="text-center font-psemibold mt-1">
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.name}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: null,
          }}
          removeClippedSubviews={false}
        />

        {/* Equipment Section */}
        <View className="px-2">
          <Text className="font-psemibold mt-3">Filter by Equipment</Text>
        </View>
        <FlatList
          ref={equipmentListRef}
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
                <Image source={{ uri: item.img }} className="w-full h-full" />
              </View>
              <Text className="w-[100px] text-center font-psemibold mt-1">
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.name}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: null,
          }}
          removeClippedSubviews={false}
        />
        <Text className="px-2 font-pbold">{`${filteredExercisesCount} exercises`}</Text>
      </>
    );
  }
);

const AddExercises = ({ onClose, onAddExercises }: AddExercisesProps) => {
  const exercises = useMemo(() => getAllExercises(exercisesData), []);
  const muscleGroups = useMemo(
    () =>
      exercisesData.map((exercise) => ({
        name: exercise.muscleGroups,
        img: exercise.img,
      })),
    []
  );
  const equipment = useMemo(() => filterEquipment(exercisesData), []);

  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  const filteredExercises = useMemo(
    () =>
      exercises.filter((exercise) => {
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
      }),
    [selectedMuscle, selectedEquipment, searchTerm]
  );

  const handleMuscleFilter = (muscleName: string) => {
    setSelectedMuscle(selectedMuscle === muscleName ? null : muscleName);
  };

  const handleEquipmentFilter = (equipmentName: string) => {
    setSelectedEquipment(
      selectedEquipment === equipmentName ? null : equipmentName
    );
  };

  const handleSearch = (text: string) => {
    setSearchTerm(text);
  };

  const toggleSelection = (item: Exercise) => {
    setSelectedExercises((prev) => {
      const isSelected = prev.some((exercise) => exercise.name === item.name);
      if (isSelected) {
        return prev.filter((exercise) => exercise.name !== item.name);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleAdd = () => {
    console.log("selectedExercises", selectedExercises);
    onAddExercises(selectedExercises); // Pass to parent
    setSelectedExercises([]); // Reset selection
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
    const equipmentSet: EquipmentInfo[] = [];

    exercisesData.forEach((muscleGroup) => {
      muscleGroup.exercises.forEach((exercise) => {
        if (exercise.equipment && exercise.equipment.img) {
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

  const memoizedHeader = useMemo(
    () => (
      <ListHeader
        muscleGroups={muscleGroups}
        equipment={equipment}
        selectedMuscle={selectedMuscle}
        selectedEquipment={selectedEquipment}
        handleMuscleFilter={handleMuscleFilter}
        handleEquipmentFilter={handleEquipmentFilter}
        filteredExercisesCount={filteredExercises.length}
      />
    ),
    [
      muscleGroups,
      equipment,
      selectedMuscle,
      selectedEquipment,
      filteredExercises.length,
    ]
  );

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
            onPress={handleAdd}
          >
            <ButtonText>Add</ButtonText>
          </Button>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <FlatList
        className="flex-1"
        ListHeaderComponent={memoizedHeader}
        data={filteredExercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`flex-row items-center px-2 py-2 ${
              selectedExercises.some((exercise) => exercise.name === item.name)
                ? "bg-gray-200"
                : ""
            }`}
            onPress={() => toggleSelection(item)}
          >
            <Image
              source={{ uri: item.img }}
              className="w-16 h-16 rounded-lg"
            />
            <Text className="ml-4 font-psemibold">{item.name}</Text>
          </TouchableOpacity>
        )}
        initialNumToRender={10}
        maxToRenderPerBatch={20}
        windowSize={5}
      />
    </View>
  );
};

export default AddExercises;
