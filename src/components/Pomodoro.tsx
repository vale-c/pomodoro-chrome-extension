import { useState, useEffect, FunctionComponent } from "react";
import { SettingsModal } from "./SettingsModal";
import { HelpModal } from "./HelpModal";
import { HelpCircleIcon, HistoryIcon, SettingsIcon } from "./icons/Icons";
import success from "../assets/success.mp3";

const DEFAULT_FOCUS_DURATION = 1500; // 25 minutes
const DEFAULT_BREAK_DURATION = 300; // 5 minutes

const MAX_STROKE_LENGTH = 2 * Math.PI * 120;

const audio = new Audio(success);

export const Pomodoro: FunctionComponent = () => {
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState("focus");
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_DURATION);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_DURATION);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");

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
      setTimeLeft(nextType === "focus" ? focusDuration : breakDuration);
      setSessionType(nextType);
      setIsRunning(false);

      audio.play();
      setShowCompletionMessage(true);
      setCompletionMessage(
        sessionType === "focus"
          ? "Focus session complete! Time for a break!"
          : "Break over! Time to focus!"
      );
    }
  }, [timeLeft, sessionType, focusDuration, breakDuration]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
    if (
      !isRunning &&
      timeLeft === (sessionType === "focus" ? focusDuration : breakDuration)
    ) {
      // Only set the time if starting for the first time or after a reset
      setTimeLeft(sessionType === "focus" ? focusDuration : breakDuration);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === "focus" ? focusDuration : breakDuration);
    setShowCompletionMessage(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
  };

  const getProgress = () => {
    return 100 * (1 - timeLeft / focusDuration);
  };

  const toggleSettings = () => setShowSettings(!showSettings);
  const toggleHelp = () => setShowHelp(!showHelp);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#ff6b6b] to-[#4caf50]">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-[400px] max-w-full">
        {showCompletionMessage && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
            <div className="bg-white p-4 rounded-lg shadow-lg text-lg">
              {completionMessage}
              <button
                className="ml-4 bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => setShowCompletionMessage(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <SettingsIcon
              className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={toggleSettings}
            />
            <HistoryIcon className="h-6 w-6 text-gray-500 hover:text-gray-700 ml-4 cursor-pointer" />
            <HelpCircleIcon
              className="h-6 w-6 text-gray-500 hover:text-gray-700 ml-4 cursor-pointer"
              onClick={toggleHelp}
            />
            <HelpModal isOpen={showHelp} onClose={toggleHelp} />
          </div>
        </div>
        {showSettings && (
          <SettingsModal
            setFocusDuration={(duration) => {
              setFocusDuration(duration);
              if (!isRunning) setTimeLeft(duration);
            }}
            setBreakDuration={(duration) => {
              setBreakDuration(duration);
              if (!isRunning && sessionType === "break") setTimeLeft(duration);
            }}
            onClose={toggleSettings}
          />
        )}
        <div className="flex items-center justify-center text-center">
          <svg width="260" height="260" className="relative">
            <circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              stroke="#ddd"
              strokeWidth="20"
            />
            <circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              stroke={sessionType === "focus" ? "#ff6b6b" : "#4caf50"}
              strokeWidth="20"
              strokeDasharray={MAX_STROKE_LENGTH}
              strokeDashoffset={MAX_STROKE_LENGTH * (getProgress() / 100)}
              transform="rotate(-90 130 130)"
            />
            <text
              x="50%"
              y="50%"
              fill="grey"
              dy=".3em"
              fontWeight="bold"
              fontSize="3rem"
              textAnchor="middle"
            >
              {formatTime(timeLeft)}
            </text>
            <text
              x="50%"
              y="50%"
              fill={sessionType === "focus" ? "#ff6b6b" : "#4caf50"}
              dy="2.5em"
              fontWeight="bold"
              fontSize="1.5rem"
              textAnchor="middle"
            >
              {sessionType === "focus" ? "Focus" : "Break"}
            </text>
          </svg>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={handleStartPause}
            className={`mr-4 px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              sessionType === "focus"
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white font-semibold transition-colors duration-200"
          >
            Reset
          </button>
        </div>
        <div className="mt-8 flex justify-between items-center">
          <div className="font-medium text-gray-500">
            <span className="font-semibold">Focus: </span>
            {focusDuration / 60} min
          </div>
          <div className="font-medium text-gray-500">
            <span className="font-semibold">Break: </span>
            {breakDuration / 60} min
          </div>
        </div>
      </div>
    </div>
  );
};
