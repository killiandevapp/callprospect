// src/hooks/useCallTimer.ts
import { useCallback, useEffect, useState } from "react";

export function useCallTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  // start timer
  const start = useCallback(() => {
    setSeconds(0);
    setRunning(true);
  }, []);

  // stop timer
  const stop = useCallback(() => {
    setRunning(false);
  }, []);

  // reset timer
  const reset = useCallback(() => {
    setRunning(false);
    setSeconds(0);
  }, []);

  // timer loop
  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [running]);

  return { seconds, running, start, stop, reset };
}
