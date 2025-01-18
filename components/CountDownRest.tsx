import { StyleSheet, Text, View, Platform, AppState } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Duration, formatDuration, intervalToDuration } from "date-fns";
import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from "@notifee/react-native";
import BackgroundTimer from "react-native-background-timer";

interface CountDownRestProps {
  seconds: number;
  isRunning: boolean;
  onStop: (param: boolean) => void;
}

const CountDownRest = ({
  seconds = 1,
  isRunning = false,
  onStop,
}: CountDownRestProps) => {
  const [timeRemaining, setTimeRemaining] = useState(seconds);
  const endTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const appStateRef = useRef(AppState.currentState);

  const updateTimer = () => {
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
    console.log("🚀 ~ updateTimer ~ remaining:", remaining);

    if (remaining <= 0) {
      BackgroundTimer.stopBackgroundTimer();
      triggerCompletionNotification();
      onStop(false);
      setTimeRemaining(0);
      return;
    }

    setTimeRemaining(remaining);
    // updateNotification(remaining);
  };

  const createNotificationChannel = async () => {
    if (Platform.OS === "android") {
      await notifee.createChannel({
        id: "rest",
        name: "Rest Timer",
        lights: false,
        vibration: true,
        importance: AndroidImportance.HIGH,
      });
    }
  };

  const updateNotification = async (remaining: number) => {
    await notifee.displayNotification({
      title: "Rest Timer Running",
      body: `${remaining} seconds remaining`,
      android: {
        channelId: "rest",
        ongoing: true,
        pressAction: {
          id: "default",
        },
        timestamp: Date.now(),
        showTimestamp: true,
      },
    });
  };

  const triggerCompletionNotification = async () => {
    try {
      await notifee.displayNotification({
        title: "Rest Complete!",
        body: "Time to start your next set!",
        android: {
          channelId: "rest",
          importance: AndroidImportance.HIGH,
          sound: "default",
        },
        ios: {
          sound: "default",
        },
      });
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  useEffect(() => {
    createNotificationChannel();

    if (isRunning) {
      endTimeRef.current = Date.now() + timeRemaining * 1000;
      BackgroundTimer.runBackgroundTimer(updateTimer, 1000);
    } else {
      BackgroundTimer.stopBackgroundTimer();
    }

    return () => {
      BackgroundTimer.stopBackgroundTimer();
    };
  }, [isRunning]);

  useEffect(() => {
    setTimeRemaining(seconds);
    if (isRunning) {
      endTimeRef.current = Date.now() + seconds * 1000;
    }
  }, [seconds]);

  const duration = intervalToDuration({ start: 0, end: timeRemaining * 1000 });

  const formatTime = (value: Duration["minutes"] | Duration["seconds"]) =>
    String(value || 0).padStart(2, "0");

  const displayTime = `${formatTime(duration.minutes)}:${formatTime(
    duration.seconds
  )}`;

  return (
    <>
      {isRunning && (
        <View>
          <Text className="font-plight text-lg text-zinc-50">
            {displayTime}
          </Text>
        </View>
      )}
    </>
  );
};

export default CountDownRest;
