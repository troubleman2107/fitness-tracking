import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Link, useLocalSearchParams } from "expo-router";
import CreateExercise from "@/components/CreateExercise";
import { useStore } from "@/store/useTemplateStore";
import { Template as SessionTemplate } from "@/types/session";

const CreateDetail = () => {
  const { create } = useLocalSearchParams();
  const templates = useStore((state) => state.templates).find(
    (template) => template.id === create
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-zinc-100 flex-1">
        <View className="p-2">
          <View className=" mb-[6px] h-full">
            <CreateExercise
              onClose={() => {}}
              templateSelect={(templates as SessionTemplate) ?? null}
            />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default CreateDetail;

const styles = StyleSheet.create({});
