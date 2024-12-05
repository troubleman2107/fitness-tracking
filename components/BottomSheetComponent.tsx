import React, { useEffect, useReducer, useState } from "react";
import { BottomSheet, Button, ListItem } from "@rneui/themed";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FormField from "./FormField";
import CustomButton from "./CustomButton";
import { InitialState } from "@/app";

const initialState = {
  reps: "",
  weight: "",
};

type ACTIONTYPE =
  | { type: "set_reps"; payload: string }
  | { type: "set_weight"; payload: string };

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
  infoSet: {
    reps: string;
    weight: string;
  };
};

const BottomSheetComponent: React.FunctionComponent<
  BottomSheetComponentProps
> = ({ isVisible, toggle, infoSet }: BottomSheetComponentProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: "set_reps", payload: infoSet.reps });
    dispatch({ type: "set_weight", payload: infoSet.weight });
  }, [infoSet]);

  return (
    <SafeAreaProvider>
      <Button
        title="Open Bottom Sheet"
        // onPress={() => setIsVisible(true)}
        buttonStyle={styles.button}
      />
      <BottomSheet
        modalProps={{}}
        isVisible={isVisible}
        onBackdropPress={toggle}
      >
        <View className="py-2 px-5 h-[200px] bg-white">
          <View className="w-full flex flex-row items-center justify-center gap-3">
            <Text className="font-pbold text-[18px]">Set 1 / 3</Text>
            <Text className="text-['#67BC5F'] font-psemibold">
              Goal: {infoSet.reps} x {infoSet.weight}
            </Text>
          </View>
          <View className="mt-3 flex flex-row justify-center gap-2 items-center">
            <View className="flex flex-row items-center justify-center gap-2 ">
              <FormField
                type="number"
                handleChangeText={(value) => {
                  dispatch({ type: "set_reps", payload: value });
                }}
                value={state.reps}
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
                    payload: value,
                  });
                }}
                value={state.weight}
                placeholder="Weight"
                otherStyles="flex flex-row items-center w-[100px] gap-2 mb-2 mr-[]"
              />
            </View>
          </View>
          <View className="w-full flex items-center mt-3">
            <CustomButton
              containerStyles="w-[320px]"
              title="SUBMIT"
              handlePress={() => {}}
            />
          </View>
        </View>
      </BottomSheet>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 10,
  },
});

export default BottomSheetComponent;
