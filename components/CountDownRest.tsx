import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Duration, formatDuration, intervalToDuration } from "date-fns";

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

  useEffect(() => {
    // If time is running out, set up an interval
    if (isRunning && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimeout(() => {
              onStop(false);
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Clean up the interval when component unmounts or time runs out
      return () => clearInterval(timer);
    }
  }, [isRunning, timeRemaining]);

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
          <Text>{displayTime}</Text>
        </View>
      )}
    </>
  );
};

export default CountDownRest;
