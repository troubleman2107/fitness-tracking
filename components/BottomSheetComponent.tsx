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

const initialState: { reps: number | null; weight: number | null } = {
  reps: null,
  weight: null,
};

type ACTIONTYPE =
  | { type: "set_reps"; payload: number | null }
  | { type: "set_weight"; payload: number | null };

function reducer(state: typeof initialState, action: ACTIONTYPE) {
  switch (action.type) {
    case "set_reps":
      return { ...state, reps: action.payload };
    case "set_weight":
      return { ...state, weight: action.payload };
    // case "increment":
    //   return { count: state.count + action.payload };
    // case "decrement":
    //   return { count: state.count - Number(action.payload) };
    default:
      return state;
  }
}

type BottomSheetComponentProps = {
  isVisible: boolean;
  toggle: () => void;
  infoSet: InitialState["currentSet"];
  handleRest?: (infoSet: InitialState["currentSet"]) => void;
};

const BottomSheetComponent: React.FunctionComponent<
  BottomSheetComponentProps
> = ({ isVisible, toggle, infoSet, handleRest }: BottomSheetComponentProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  console.log("🚀 ~ infoSet:", infoSet);

  useEffect(() => {
    dispatch({ type: "set_reps", payload: infoSet.reps });
    dispatch({ type: "set_weight", payload: infoSet.weight });
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
                    dispatch({ type: "set_reps", payload: Number(value) });
                  }}
                  value={state.reps ? String(state.reps) : ""}
                  placeholder="Reps"
                  otherStyles="flex flex-row items-center w-[100px] gap-2 mb-2 mr-[]"
                />
              </View>
              <View className="flex flex-row items-center gap-2  justify-center">
                <FormField
                  type="number"
                  handleChangeText={(value) => {
                    dispatch({
                      type: "set_weight",
                      payload: Number(value),
                    });
                  }}
                  value={state.weight ? String(state.weight) : ""}
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
                    reps: state.reps,
                    weight: state.weight,
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
