import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import CustomButton from "@/components/CustomButton";
import BottomSheetComponent from "@/components/BottomSheetComponent";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Icon } from "@rneui/base";
import CreateExercise from "@/components/CreateExercise";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";

const Create = () => {
  const [isCreateTemplate, setIsCreateTemplate] = useState(true);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="h-full bg-slate-50 flex-1">
        <View className="p-2">
          <View className="p-8 bg-slate-100 mb-[6px] rounded-[20px] h-full">
            <View className="flex flex-row justify-between items-center">
              <Text className="font-pbold text-xl text-slate-600">
                Template
              </Text>
              <Button>
                <ButtonText
                  onPress={() => {
                    setIsCreateTemplate(true);
                  }}
                >
                  Create
                </ButtonText>
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Actionsheet
          useRNModal={true}
          snapPoints={[85]}
          isOpen={isCreateTemplate}
          onClose={() => setIsCreateTemplate(false)}
        >
          <ActionsheetBackdrop />
          <ActionsheetContent className="p-2">
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <CreateExercise />
          </ActionsheetContent>
        </Actionsheet>
      </KeyboardAvoidingView>
      {/* <BottomSheetComponent
        toggle={() => setIsCreateTemplate(!isCreateTemplate)}
        isVisible={isCreateTemplate}
        content={
          <View
            className="h-[100vh] bg-white pt-20 flex-1"
            style={{ paddingBottom: useSafeAreaInsets().bottom }}
          >
            <View className="w-full flex flex-row justify-end pr-5">
              <TouchableOpacity onPress={() => setIsCreateTemplate(false)}>
                <Icon name="close" className="w-7 h-7" />
              </TouchableOpacity>
            </View>
            <CreateExercise />
          </View>
        }
      /> */}
    </SafeAreaProvider>
  );
};

export default Create;

const styles = StyleSheet.create({});
