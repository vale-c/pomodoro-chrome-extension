import { useEffect, useState } from 'react';
import success from '../assets/success.mp3';

const DEFAULT_FOCUS_DURATION = 1500; // 25 minutes
const DEFAULT_BREAK_DURATION = 300; // 5 minutes

const audio = new Audio(success);

export const PomodoroTimer = () => {
  const [timer, setTimer] = useState(DEFAULT_FOCUS_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('focus'); // 'focus' or 'break'

  const MAX_STROKE_LENGTH = 2 * Math.PI * 120;

  const toggle = () => {
    if (!isActive && timer <= 0) {
      // Reset timer when completed and starting a new session
      const duration =
        sessionType === 'focus'
          ? DEFAULT_FOCUS_DURATION
          : DEFAULT_BREAK_DURATION;
      setTimer(duration);
      chrome.storage.local.set({ timer: duration });
    }

    const newState = !isActive;
    chrome.storage.local.set({ isActive: newState });
    setIsActive(newState);
  };

  const reset = () => {
    const duration =
      sessionType === 'focus' ? DEFAULT_FOCUS_DURATION : DEFAULT_BREAK_DURATION;
    chrome.storage.local.set({ timer: duration, isActive: false });
    setTimer(duration);
    setIsActive(false);
  };

  const getProgress = () => {
    const duration =
      sessionType === 'focus' ? DEFAULT_FOCUS_DURATION : DEFAULT_BREAK_DURATION;
    return ((duration - timer) / duration) * 100;
  };

  useEffect(() => {
    chrome.storage.local.get(['timer', 'isActive', 'sessionType'], (result) => {
      setTimer(result.timer);
      setIsActive(result.isActive);
      setSessionType(result.sessionType || 'focus');
    });

    const interval = setInterval(() => {
      chrome.storage.local.get(
        ['timer', 'isActive', 'sessionType'],
        (result) => {
          setTimer(result.timer);
          setIsActive(result.isActive);
          setSessionType(result.sessionType || 'focus');

          if (result.isActive && result.timer <= 0) {
            audio.play();
            setIsActive(false);
            chrome.storage.local.set({ isActive: false });

            if (sessionType === 'focus') {
              setSessionType('break');
              setTimer(DEFAULT_BREAK_DURATION);
              chrome.storage.local.set({
                sessionType: 'break',
                timer: DEFAULT_BREAK_DURATION,
              });
            } else {
              setSessionType('focus');
              setTimer(DEFAULT_FOCUS_DURATION);
              chrome.storage.local.set({
                sessionType: 'focus',
                timer: DEFAULT_FOCUS_DURATION,
              });
            }
          }
        }
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionType]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = `0${time % 60}`.slice(-2);
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex items-center justify-center">
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
            strokeDashoffset={MAX_STROKE_LENGTH * (getProgress() / 100)}
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
