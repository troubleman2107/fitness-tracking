import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { icons } from "@/constants";

type FormFieldProps = {
  title?: string;
  value: string | undefined;
  placeholder?: string;
  handleChangeText: (text: string) => void;
  otherStyles?: string;
  type?: string;
  [key: string]: any;
};

const FormField = ({
  title,
  value,
  placeholder,
  otherStyles,
  handleChangeText,
  type,
  ...props
}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles} flex flex-col`}>
      {title && (
        <Text className="text-base text-slate-600 font-pmedium mb-2">
          {title}
        </Text>
      )}
      <View className="w-full h-16 px-4 bg-slate-300 rounded-2xl border-slate-200 focus:border-secondary flex flex-row items-center">
        <TextInput
          className="flex-1 text-slate-9001 font-psemibold text-base text-center"
          keyboardType={type === "string" ? "default" : "numeric"}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={handleChangeText}
          secureTextEntry={title === "Password" && !showPassword}
          {...props}
        />
        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;

const styles = StyleSheet.create({});
