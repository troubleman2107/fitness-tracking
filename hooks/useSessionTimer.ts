import { useState, useEffect } from "react";

export const useSessionTimer = (isActive: boolean) => {
  const [startTime, setStartTime] = useState(Date.now());
  console.log("🚀 ~ useSessionTimer ~ startTime:", startTime);
  const [elapsedTime, setElapsedTime] = useState(0);
  console.log("🚀 ~ useSessionTimer ~ elapsedTime:", elapsedTime);
  const [isStop, setIsStop] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isActive) {
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
    setElapsedTime(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return { elapsedTime, formatTime, resetTimer: () => stopTimer() };
};
