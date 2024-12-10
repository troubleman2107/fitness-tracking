import {
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@rneui/base";

const Create = () => {
  const [isCreateTemplate, setIsCreateTemplate] = useState(false);

  return (
    <>
      <SafeAreaView className="h-full bg-slate-50 flex-1">
        <View className="p-2">
          <View className="p-8 bg-slate-100 mb-[6px] rounded-[20px] h-full">
            <View className="flex flex-row justify-between">
              <Text className="font-pbold text-xl text-slate-600">
                Template
              </Text>
              <CustomButton
                handlePress={() => {
                  setIsCreateTemplate(true);
                }}
                title="Create"
                containerStyles={"w-[75px] min-h-[30px]"}
                textStyles="text-sm"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
      <BottomSheetComponent
        toggle={() => setIsCreateTemplate(!isCreateTemplate)}
        isVisible={isCreateTemplate}
        content={
          <View
            className="h-[100vh] bg-white pt-20"
            style={{ paddingBottom: useSafeAreaInsets().bottom }}
          >
            <View className="w-full flex flex-row justify-end pr-5">
              <TouchableOpacity onPress={() => setIsCreateTemplate(false)}>
                <Icon name="close" className="w-7 h-7" />
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </>
  );
};

export default Create;

const styles = StyleSheet.create({});
