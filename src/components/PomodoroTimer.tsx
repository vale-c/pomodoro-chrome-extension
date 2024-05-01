import { useEffect, useState } from 'react';
import completed from '../assets/completed.mp3';
import { DEFAULT_BREAK_DURATION, DEFAULT_FOCUS_DURATION } from '../constants';
import { formatTime } from '../background';

const MAX_STROKE_LENGTH = 2 * Math.PI * 120;
const audio = new Audio(completed);

export const PomodoroTimer = () => {
  const [timer, setTimer] = useState(DEFAULT_FOCUS_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('focus');

  const prepareNextSession = () => {
    const nextSessionType = sessionType === 'focus' ? 'break' : 'focus';
    const duration =
      nextSessionType === 'focus'
        ? DEFAULT_FOCUS_DURATION
        : DEFAULT_BREAK_DURATION;
    setSessionType(nextSessionType);
    setTimer(duration); // Update timer but do not start it automatically
  };

  useEffect(() => {
    let interval: number | null = null;
    if (isActive) {
      interval = window.setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval!);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  useEffect(() => {
    if (timer === 0) {
      audio.play();
      setIsActive(false); // Stop the timer
      prepareNextSession();
    }
  }, [timer]);

  const toggle = () => {
    setIsActive(!isActive); // Toggle the current state to start or pause the timer
  };

  const reset = () => {
    const initialDuration =
      sessionType === 'focus' ? DEFAULT_FOCUS_DURATION : DEFAULT_BREAK_DURATION;
    setTimer(initialDuration);
    setIsActive(false);
  };

  const getProgress = () => {
    const duration =
      sessionType === 'focus' ? DEFAULT_FOCUS_DURATION : DEFAULT_BREAK_DURATION;
    return ((duration - timer) / duration) * 100;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
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
            stroke={sessionType === 'focus' ? '#ff6b6b' : '#4caf50'}
            strokeWidth="20"
            strokeDasharray={MAX_STROKE_LENGTH}
            strokeDashoffset={(MAX_STROKE_LENGTH * getProgress()) / 100}
            transform="rotate(-90 130 130)"
          />
          <text
            x="50%"
            y="50%"
            fill="white"
            dy=".3em"
            fontWeight="bold"
            fontSize="3rem"
            textAnchor="middle"
          >
            {formatTime(timer)}
          </text>
          <text
            x="50%"
            y="50%"
            fill={sessionType === 'focus' ? '#ff6b6b' : '#4caf50'}
            dy="2.5em"
            fontWeight="bold"
            fontSize="1.5rem"
            textAnchor="middle"
          >
            {sessionType === 'focus' ? 'Focus' : 'Break'}
          </text>
        </svg>
      </div>
      <div className="flex mt-8">
        <button
          className="px-4 py-2 mr-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          onClick={toggle}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button
          className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
          onClick={reset}
        >
          Reset
        </button>
      </div>
    </div>
  );
};
