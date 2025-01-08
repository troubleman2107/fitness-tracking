import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { ArrowLeftIcon, Icon } from "./icon";

interface PrevIconButtonProps {
  onClick: () => void;
}

const PrevIconButton = ({ onClick }: PrevIconButtonProps) => {
  return (
    <TouchableOpacity
      className="bg-zinc-100 rounded w-10 h-10 flex justify-center items-center"
      onPress={onClick}
    >
      <Icon as={ArrowLeftIcon} className="text-typography-500 m-2 w-5 h-5" />
    </TouchableOpacity>
  );
};

export default PrevIconButton;

const styles = StyleSheet.create({});
