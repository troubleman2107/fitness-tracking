import React, { useEffect, useReducer, useState } from "react";
import { BottomSheet, Button, ListItem } from "@rneui/themed";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FormField from "./FormField";
import CustomButton from "./CustomButton";

type BottomSheetComponentProps = {
  isVisible: boolean;
  toggle: () => void;
  content: JSX.Element;
};

const BottomSheetComponent: React.FunctionComponent<
  BottomSheetComponentProps
> = ({ isVisible, toggle, content }: BottomSheetComponentProps) => {
  return (
    <BottomSheet
      backdropStyle={{ backgroundColor: "transparent" }}
      modalProps={{ presentationStyle: "fullScreen", transparent: false }}
      isVisible={isVisible}
      onBackdropPress={toggle}
      containerStyle={{ flex: 1 }}
    >
      {content}
    </BottomSheet>
  );
};

export default BottomSheetComponent;
