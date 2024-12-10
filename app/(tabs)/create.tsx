import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomButton from "@/components/CustomButton";

const Create = () => {
  return (
    <SafeAreaView className="h-full bg-slate-50 flex-1">
      <View className="p-2">
        <View className="p-8 bg-slate-100 mb-[6px] rounded-[20px] h-full">
          <View className="flex flex-row justify-between">
            <Text className="font-pbold text-xl text-slate-600">Template</Text>
            <CustomButton
              handlePress={() => {}}
              title="Create"
              containerStyles={"w-[75px] min-h-[30px]"}
              textStyles="text-sm"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Create;

const styles = StyleSheet.create({});
