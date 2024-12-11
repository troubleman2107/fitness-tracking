import { StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomButton from "./CustomButton";
import { Col, Row, Grid } from "react-native-easy-grid";

const CreateExercise = () => {
  return (
    <View>
      <View className="w-full flex items-center justify-center mt-20 gap-3">
        <View className="flex flex-row gap-5">
          <Text>Exercise</Text>
          <Text>Kg</Text>
          <Text>Reps</Text>
        </View>
        <CustomButton
          handlePress={() => {}}
          title="Add Exercise"
          containerStyles="w-[200px] min-h-[50] bg-slate-400"
          textStyles="text-ls"
        />
        <CustomButton
          handlePress={() => {}}
          title="Cancle Template"
          containerStyles="w-[200px] min-h-[50] bg-red-400"
          textStyles="text-ls"
        />
      </View>
    </View>
  );
};

export default CreateExercise;

const styles = StyleSheet.create({});
