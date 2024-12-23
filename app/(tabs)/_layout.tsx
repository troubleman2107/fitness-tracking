import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { Tabs, Redirect } from "expo-router";
import { icons } from "../../constants";

type TabIconProps = {
  icon: ImageSourcePropType;
  color: string;
  name: string;
  focused: boolean;
};

const TabIcon = ({ icon, color, name, focused }: TabIconProps) => {
  return (
    <View className="flex items-center justify-center gap-2 w-24">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs `}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FFA001",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#161622",
            borderTopColor: "#232533",
            borderTopWidth: 1,
            height: 84,
            paddingTop: 15,
          },
        }}
        detachInactiveScreens={true}
      >
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            headerShown: false,
            tabBarIcon: ({ color, focused }): React.ReactNode => {
              return (
                <TabIcon
                  color={color}
                  focused={focused}
                  name="Create"
                  icon={icons.plus as ImageSourcePropType}
                />
              );
            },
          }}
        />
        <Tabs.Screen
          name="session"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }): React.ReactNode => {
              return (
                <TabIcon
                  color={color}
                  focused={focused}
                  name="Session"
                  icon={icons.home as ImageSourcePropType}
                />
              );
            },
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }): React.ReactNode => {
              return (
                <TabIcon
                  color={color}
                  focused={focused}
                  name="Report"
                  icon={icons.bookmark as ImageSourcePropType}
                />
              );
            },
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
