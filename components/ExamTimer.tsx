"use client";

import { useEffect, useState, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface ExamTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  storageKey: string;
}

export default function ExamTimer({ durationMinutes, onTimeUp, storageKey }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Update ref to prevent stale closures
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // Check localStorage first
    const savedTime = localStorage.getItem(`timer_left_${storageKey}`);
    if (savedTime !== null) {
      const parsed = parseInt(savedTime, 10);
      setTimeLeft(parsed > 0 ? parsed : 0);
    } else {
      setTimeLeft(durationMinutes * 60);
    }
  }, [durationMinutes, storageKey]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      localStorage.removeItem(`timer_left_${storageKey}`);
      onTimeUpRef.current();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        const nextTime = prev - 1;
        localStorage.setItem(`timer_left_${storageKey}`, nextTime.toString());
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, storageKey]);

  if (timeLeft === null) {
    return (
      <div className="flex items-center gap-2 text-primary font-black bg-slate-100 px-4 py-2 rounded-2xl animate-pulse">
        <Clock className="h-5 w-5 text-accent" />
        <span>جاري التحميل...</span>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const isLowTime = timeLeft < 120; // less than 2 minutes

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black transition-colors duration-300 ${
        isLowTime
          ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
          : "bg-primary text-white"
      }`}
    >
      {isLowTime ? (
        <AlertTriangle className="h-5 w-5 text-red-500" />
      ) : (
        <Clock className="h-5 w-5 text-accent" />
      )}
      <span dir="ltr" className="text-lg tracking-wider">
        {formattedTime}
      </span>
    </div>
  );
}
