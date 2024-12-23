import { useState, useEffect } from "react";

export const useSessionTimer = (isActive: boolean) => {
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isStop, setIsStop] = useState(false);
  console.log("🚀 ~ useSessionTimer ~ isStop:", isStop);

  useEffect(() => {
    console.log("run this");
  }, [isActive]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isActive && !isStop) {
      setStartTime(Date.now());
      setElapsedTime(0);

      intervalId = setInterval(() => {
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, isStop]);

  const stopTimer = () => {
    setIsStop(true);
    setElapsedTime(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return {
    elapsedTime,
    formatTime,
    resetTimer: () => stopTimer(),
  };
};
