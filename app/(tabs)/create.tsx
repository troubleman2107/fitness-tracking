import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CreateExercise from "@/components/CreateExercise";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { useStore } from "@/store/useTemplateStore";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";

const Create = () => {
  const [isCreateTemplate, setIsCreateTemplate] = useState(false);
  const templates = useStore((state) => state.templates);
  console.log("🚀 ~ Create ~ templates:", templates);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-slate-50 flex-1">
        <View className="p-2">
          <View className="p-4 bg-slate-100 mb-[6px] rounded-[20px] h-full">
            <View className="flex flex-row justify-between items-center mb-10">
              <Text className="font-pbold text-xl text-slate-600">
                Template
              </Text>
              <Button
                onPress={() => {
                  setIsCreateTemplate(true);
                }}
              >
                <ButtonText>Create</ButtonText>
              </Button>
            </View>
            {templates.length > 0 &&
              templates.map((template, iTemplate) => (
                <TouchableOpacity>
                  <Card
                    size="md"
                    variant="outline"
                    className=""
                    key={iTemplate}
                  >
                    <Heading size="md" className="mb-1">
                      {template.name}
                    </Heading>
                    <Text>
                      {new Date(template.createDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Actionsheet
          useRNModal={true}
          snapPoints={[100]}
          isOpen={isCreateTemplate}
          onClose={() => setIsCreateTemplate(false)}
        >
          <ActionsheetBackdrop />
          <ActionsheetContent className="p-2">
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <CreateExercise onClose={() => setIsCreateTemplate(false)} />
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
