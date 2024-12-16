import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const CreateLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="[create]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default CreateLayout;

const styles = StyleSheet.create({});
