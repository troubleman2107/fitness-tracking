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
    <SafeAreaProvider>
      <BottomSheet
        modalProps={{}}
        isVisible={isVisible}
        onBackdropPress={toggle}
      >
        {content}
      </BottomSheet>
    </SafeAreaProvider>
  );
};

export default BottomSheetComponent;
