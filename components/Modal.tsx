import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal as RNModal,
  Pressable,
} from "react-native";

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
}) => {
  return (
    <RNModal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      className="rounded-[20px]"
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black/50"
        onPress={onClose}
      >
        <View
          className="bg-white rounded-[20px] p-6 w-5/6 max-w-sm"
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500 text-2xl">&times;</Text>
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </Pressable>
    </RNModal>
  );
};

export default Modal;
