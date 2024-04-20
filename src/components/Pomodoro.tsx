import React, { useState, useEffect, FunctionComponent } from "react";
import { SettingsModal } from "./SettingsModal";

export const Pomodoro: FunctionComponent = () => {
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState("focus");
  const [, setSessionsCompleted] = useState(0);
  const [focusDuration, setFocusDuration] = useState(1500); // Default focus duration
  const [breakDuration, setBreakDuration] = useState(300); // Default break duration
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval: number | null = null;
    if (isRunning) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (interval !== null) {
      clearInterval(interval);
    }
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      const nextType = sessionType === "focus" ? "break" : "focus";
      const nextDuration = nextType === "focus" ? focusDuration : breakDuration;
      setTimeLeft(nextDuration);
      setSessionType(nextType);
      setIsRunning(false);
    }
  }, [timeLeft, sessionType, focusDuration, breakDuration]);

  const handleStartPause = () => {
    if (
      !isRunning &&
      timeLeft === (sessionType === "focus" ? focusDuration : breakDuration)
    ) {
      setTimeLeft(sessionType === "focus" ? focusDuration : breakDuration);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === "focus" ? focusDuration : breakDuration);
    setSessionsCompleted(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
  };

  const getProgressBarWidth = () => {
    const totalDuration =
      sessionType === "focus" ? focusDuration : breakDuration;
    return `${((totalDuration - timeLeft) / totalDuration) * 100}%`;
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#ff6b6b] to-[#4caf50]">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-[400px] max-w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <SettingsIcon
              className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={toggleSettings}
            />
            <HistoryIcon className="h-6 w-6 text-gray-500 hover:text-gray-700 ml-4 cursor-pointer" />
            <HelpCircleIcon className="h-6 w-6 text-gray-500 hover:text-gray-700 ml-4 cursor-pointer" />
          </div>
        </div>
        {showSettings && (
          <SettingsModal
            setFocusDuration={setFocusDuration}
            setBreakDuration={setBreakDuration}
            onClose={toggleSettings}
          />
        )}
        <div className="text-center">
          <div className="text-8xl font-bold text-[#ff6b6b]">
            {formatTime(timeLeft)}
          </div>
          <div className="flex justify-center mt-6">
            <button
              onClick={handleStartPause}
              className={`mr-4 px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                isRunning
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isRunning
                ? "Pause"
                : timeLeft !== (sessionType === "focus" ? 1500 : 300)
                ? "Resume"
                : "Start"}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors duration-200"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="mt-8 flex justify-between items-center">
          <div className="text-gray-500">Focus: {focusDuration / 60} min</div>
          <div className="text-gray-500">Break: {breakDuration / 60} min</div>
        </div>
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-[#4caf50] rounded-full"
              style={{ width: getProgressBarWidth() }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function HelpCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
