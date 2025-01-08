import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { CloseIcon, Icon } from "./icon";

interface CloseIconButtonProps {
  onClick: () => void;
}

const CloseIconButton = ({ onClick }: CloseIconButtonProps) => {
  return (
    <TouchableOpacity
      className="rounded w-10 h-10 flex justify-center items-center"
      onPress={onClick}
    >
      <Icon as={CloseIcon} className="text-zinc-50 m-2 w-5 h-5" />
    </TouchableOpacity>
  );
};

export default CloseIconButton;

const styles = StyleSheet.create({});
