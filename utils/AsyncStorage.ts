import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveData = async <T>(key: string, value: T): Promise<void> => {
  try {
    console.log("🚀 ~ saveData ~ value:", value);
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save data for key ${key}`, e);
  }
};

export const loadData = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error(`Failed to load data for key ${key}`, e);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(`Failed to remove data for key ${key}`, e);
  }
};

export const clear = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing AsyncStorage:", error);
  }
};
