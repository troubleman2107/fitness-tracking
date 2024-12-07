import React, { useEffect, useReducer, useState } from "react";
import { BottomSheet, Button, ListItem, Dialog } from "@rneui/themed";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FormField from "./FormField";
import CustomButton from "./CustomButton";
import { InitialState } from "@/app";
import Modal from "./Modal";

type BottomSheetComponentProps = {
  isVisible: boolean;
  toggle: () => void;
  infoSet: InitialState["currentSet"];
  handleRest?: (infoSet: InitialState["currentSet"]) => void;
};

const BottomSheetComponent: React.FunctionComponent<
  BottomSheetComponentProps
> = ({ isVisible, toggle, infoSet, handleRest }: BottomSheetComponentProps) => {
  const [reps, setReps] = useState(infoSet.reps ? infoSet.reps : null);
  const [weight, setWeight] = useState(infoSet.weight ? infoSet.weight : null);

  useEffect(() => {
    if (!infoSet) {
      return;
    }

    setReps(infoSet.reps);
    setWeight(infoSet.weight);
  }, [infoSet]);

  const handleSubmit = (infoSet: InitialState["currentSet"]) => {
    if (!infoSet.reps || !infoSet.weight) {
      Alert.alert("Validation Error", "Please choose your rep or weight", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return;
    }

    if (handleRest) {
      handleRest(infoSet);
    }
    toggle();
  };

  return (
    <SafeAreaProvider>
      <Modal
        children={
          <View className="py-2 px-5 rounded-[20px]">
            <View className="w-full flex flex-row items-center justify-center gap-3">
              <Text className="text-['#67BC5F'] font-psemibold">
                Goal: {infoSet.reps} x {infoSet.weight}
              </Text>
            </View>
            <View className="mt-3 flex flex-row justify-center gap-2 items-center">
              <View className="flex flex-row items-center justify-center gap-2 ">
                <FormField
                  type="number"
                  handleChangeText={(value) => {
                    setReps(Number(value));
                  }}
                  value={reps ? String(reps) : ""}
                  placeholder="Reps"
                  otherStyles="flex flex-row items-center w-[100px] gap-2 mb-2 mr-[]"
                />
              </View>
              <View className="flex flex-row items-center gap-2  justify-center">
                <FormField
                  type="number"
                  handleChangeText={(value) => {
                    setWeight(Number(value));
                  }}
                  value={weight ? String(weight) : ""}
                  placeholder="Weight"
                  otherStyles="flex flex-row items-center w-[100px] gap-2 mb-2 mr-[]"
                />
              </View>
            </View>
            <View className="w-full flex items-center mt-3">
              <CustomButton
                containerStyles="w-full"
                title="SUBMIT"
                handlePress={() =>
                  handleSubmit({
                    reps: reps,
                    weight: weight,
                    id: infoSet.id,
                  })
                }
              />
            </View>
          </View>
        }
        isVisible={isVisible}
        onClose={toggle}
        title={"Set 1 / 3"}
      />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 10,
  },
});

export default BottomSheetComponent;
