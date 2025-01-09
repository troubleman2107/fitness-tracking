import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  Touchable,
  TouchableHighlight,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
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
import { Link, useRouter } from "expo-router";
import { supabase } from "@/src/lib/supabaseClient";
import { useFocusEffect } from "@react-navigation/native";
import { DbTemplate } from "@/src/types/database";
import { Icon, PlayIcon } from "@/components/ui/icon";

interface UserInfo {
  full_name: string | null;
  avatar_url: string | null;
}

const Create = () => {
  const router = useRouter();
  const [isCreateTemplate, setIsCreateTemplate] = useState(false);
  const [isShowHiddenItem, setIsShowHiddenItem] = useState<{
    id: string;
    isHidden: boolean;
  }>({ id: "", isHidden: false });

  const [templateSelect, setTemplateSelect] = useState<Template | null>(null);
  const templates = useStore((state) => state.templates);
  const deleteTemplate = useStore((state) => state.deleteTemplate);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const fetchTemplates = useStore((state) => state.fetchTemplates);

  useEffect(() => {
    const getUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();

        if (data && !error) {
          setUserInfo(data);
        }
      }
    };

    getUserInfo();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTemplates();
    }, [])
  );

  const handleStartTemplate = (template: DbTemplate) => {
    router.push({
      pathname: `/session/session`,
      params: { templateId: template.id },
    });
  };

  const handleCreateTemplate = (template: DbTemplate) => {
    router.push(`/create-detail/${template.id}`);
  };

  const handleOnCloseCreateModal = () => {
    setIsCreateTemplate(false);
    setTemplateSelect(null);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error);
        return;
      }
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const renderItem = ({ item }: { item: DbTemplate }) => (
    <TouchableOpacity
      className=" z-20"
      onPress={() => handleCreateTemplate(item)}
    >
      <View style={{ marginBottom: 8 }} className="mr-1">
        <Card size="md" variant="outline" className="bg-white">
          <Heading size="md" className="mb-1">
            {item.name}
          </Heading>
          <Text>
            {new Date(item.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Text>
        </Card>
      </View>
    </TouchableOpacity>
  );

  const renderHiddenItem = ({ item }: { item: DbTemplate }) => (
    <View className="flex-1 flex-row justify-end bg-zinc-950 mb-3 rounded-lg gap-1">
      {isShowHiddenItem["id"] === item.id && isShowHiddenItem["isHidden"] && (
        <>
          <TouchableOpacity
            className="bg-zinc-50 justify-center items-center rounded-lg w-[70px]"
            onPress={() => handleStartTemplate(item)}
          >
            <Text className="bg-zinc-850 font-pextrabold">GO</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-zinc-50 justify-center items-center rounded-lg w-[70px]"
            onPress={() => deleteTemplate(item.id)}
          >
            <Text className="text-zinc-800 font-pextrabold">DEL</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-zinc-900 flex-1">
        <View className="">
          <View className="p-4 bg-zinc-950 mb-[6px] rounded-[20px] h-full">
            <View className="flex flex-row items-center mb-6">
              <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3">
                {userInfo?.avatar_url ? (
                  <Image
                    source={{ uri: userInfo.avatar_url }}
                    className="w-full h-full"
                  />
                ) : (
                  <View className="w-full h-full bg-primary-200 items-center justify-center">
                    <Text className="text-white text-lg font-bold">
                      {userInfo?.full_name?.[0]?.toUpperCase() || "?"}
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-lg font-pbold text-white">
                  {userInfo?.full_name || "User"}
                </Text>
                <Text className="text-sm text-zinc-50">Welcome back!</Text>
              </View>
            </View>

            <View className="flex flex-row justify-between items-center mb-10">
              <Text className="font-pbold text-xl text-zinc-50">Template</Text>
              <View className="flex flex-row gap-2">
                <Button onPress={handleLogout}>
                  <ButtonText>Logout</ButtonText>
                </Button>
                <Button
                  onPress={() => {
                    router.push(`/create-detail/new`);
                  }}
                >
                  <ButtonText>Create</ButtonText>
                </Button>
              </View>
            </View>
            <SwipeListView
              data={templates}
              renderItem={renderItem}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-150}
              disableRightSwipe
              keyExtractor={(item) => item.id}
              onRowOpen={(rowKey) => {
                setIsShowHiddenItem({ id: rowKey, isHidden: true });
              }}
              onRowClose={(rowKey) => {
                setIsShowHiddenItem({ id: rowKey, isHidden: false });
              }}
            />
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Actionsheet
          useRNModal={true}
          snapPoints={[90]}
          isOpen={isCreateTemplate}
          onClose={() => setIsCreateTemplate(false)}
        >
          <ActionsheetBackdrop />
          <ActionsheetContent className="p-2">
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <CreateExercise
              templateSelect={templateSelect}
              onClose={handleOnCloseCreateModal}
            />
          </ActionsheetContent>
        </Actionsheet>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
};

export default Create;

const styles = StyleSheet.create({});
