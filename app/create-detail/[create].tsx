import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Link, useLocalSearchParams } from "expo-router";
import CreateExercise from "@/components/CreateExercise";

const CreateDetail = () => {
  const { create } = useLocalSearchParams();

  console.log("create", create);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-slate-100 flex-1">
        <View className="p-2">
          <View className=" mb-[6px] h-full">
            <CreateExercise onClose={() => {}} />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default CreateDetail;

const styles = StyleSheet.create({});
