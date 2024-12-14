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
import { SwipeListView } from "react-native-swipe-list-view";
import { Animated } from "react-native";
import { Template } from "@/types/session";

const Create = () => {
  const [isCreateTemplate, setIsCreateTemplate] = useState(false);
  const templates = useStore((state) => state.templates);
  const deleteTemplate = useStore((state) => state.deleteTemplate);

  const renderItem = ({ item }: { item: Template }) => (
    <View style={{ marginBottom: 8 }} className="mr-1">
      <Card size="md" variant="outline" className="bg-white">
        <Heading size="md" className="mb-1">
          {item.name}
        </Heading>
        <Text>
          {new Date(item.createDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </Text>
      </Card>
    </View>
  );

  const renderHiddenItem = ({ item }: { item: Template }) => (
    <View className="flex-1 flex-row justify-end bg-slate-200 mb-3 rounded-lg">
      <TouchableOpacity
        className="bg-red-500 justify-center px-4 rounded-lg"
        onPress={() => deleteTemplate(item.id)}
      >
        <Text className="text-white font-bold">Delete</Text>
      </TouchableOpacity>
    </View>
  );

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
            <SwipeListView
              data={templates}
              renderItem={renderItem}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-75}
              disableRightSwipe
              keyExtractor={(item) => item.id}
            />
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
