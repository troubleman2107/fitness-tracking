import { useEffect, useRef, useState, useCallback } from "react";

export const useSessionTimer = (isActive: boolean) => {
  const timerRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>();
  const [elapsedTime, setElapsedTime] = useState(0);
  console.log("🚀 ~ useSessionTimer ~ elapsedTime:", elapsedTime);

  const updateTimer = useCallback(() => {
    if (!startTimeRef.current) return;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (elapsed !== timerRef.current) {
      timerRef.current = elapsed;
      setElapsedTime(elapsed);
    }

    rafRef.current = requestAnimationFrame(updateTimer);
  }, []);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      rafRef.current = requestAnimationFrame(updateTimer);
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive, updateTimer]);

  const resetTimer = useCallback(() => {
    setElapsedTime(0);
    startTimeRef.current = 0;
    timerRef.current = 0;
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  return { elapsedTime, formatTime, resetTimer };
};
