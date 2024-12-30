import React, { useEffect, useReducer, useState } from "react";
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
import Modal from "./Modal";
import { InitialState } from "@/store/useSessionStore";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { Button, ButtonIcon, ButtonText } from "./ui/button";

type ModalSetOfRepProps = {
  isVisible?: boolean;
  toggle: () => void;
  infoSet: InitialState["currentSet"];
  handleRest?: (infoSet: InitialState["currentSet"]) => void;
};

const ModalSetOfRep: React.FunctionComponent<ModalSetOfRepProps> = ({
  isVisible,
  toggle,
  infoSet,
  handleRest,
}: ModalSetOfRepProps) => {
  const [reps, setReps] = useState(infoSet.reps ? infoSet.reps : null);
  const [weight, setWeight] = useState(infoSet.weight ? infoSet.weight : null);

  useEffect(() => {
    if (!infoSet) {
      return;
    }

    infoSet.reps && setReps(infoSet.reps);
    infoSet.weight && setWeight(infoSet.weight);
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
      <View className="py-2 px-5 rounded-[20px]">
        <View className="w-full flex flex-row items-center justify-center gap-3">
          <Text className="text-['#67BC5F'] font-psemibold mb-3">
            Goal: {infoSet.reps} x {infoSet.weight}
          </Text>
        </View>
        <View className="flex flex-row justify-center gap-2 items-center">
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
        <View className="w-full flex items-center">
          <Button
            className="mt-3"
            size="md"
            variant="solid"
            action="primary"
            onPress={() =>
              handleSubmit({
                reps: reps,
                weight: weight,
                id: infoSet.id,
                status: infoSet.status,
                isDone: infoSet.isDone,
                setOrder: infoSet.setOrder,
              })
            }
          >
            <ButtonText>Submit</ButtonText>
          </Button>
        </View>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 10,
  },
});

export default ModalSetOfRep;
