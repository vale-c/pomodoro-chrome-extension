import { useEffect, useState } from 'react';
import completed from '../assets/completed.mp3';
import { DEFAULT_BREAK_DURATION, DEFAULT_FOCUS_DURATION } from '../constants';

const MAX_STROKE_LENGTH = 2 * Math.PI * 120;

export const PomodoroTimer = () => {
  const audio = new Audio(completed);

  const [timer, setTimer] = useState(DEFAULT_FOCUS_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('focus');

  useEffect(() => {
    const syncStateWithStorage = () => {
      chrome.storage.local.get(
        ['timer', 'isActive', 'sessionType'],
        (result) => {
          if (result.timer) setTimer(result.timer);
          if (result.isActive) setIsActive(result.isActive);
          if (result.sessionType) setSessionType(result.sessionType);
        }
      );
    };
    syncStateWithStorage();
    const interval = setInterval(syncStateWithStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let countdown: number | undefined;

    if (isActive && timer > 0) {
      countdown = window.setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    }

    // When timer reaches zero, stop and reset for the opposite session.
    if (timer <= 0) {
      const nextSessionType = sessionType === 'focus' ? 'break' : 'focus';
      const duration =
        nextSessionType === 'focus'
          ? DEFAULT_FOCUS_DURATION
          : DEFAULT_BREAK_DURATION;

      clearInterval(countdown);
      setIsActive(false);
      setSessionType(nextSessionType);
      setTimer(duration);
      chrome.storage.local.set({
        sessionType: nextSessionType,
        timer: duration,
        isActive: false,
      });
      audio.play();
    }

    return () => {
      clearInterval(countdown);
    };
  }, [timer, isActive, sessionType]);

  const toggle = () => {
    setIsActive(!isActive);
    chrome.storage.local.set({ isActive: !isActive }, () => {
      if (!isActive) {
        // If it was not active and now is starting
        chrome.storage.local.get('sessionType', (data) => {
          const duration =
            data.sessionType === 'focus'
              ? DEFAULT_FOCUS_DURATION
              : DEFAULT_BREAK_DURATION;
          setTimer(duration);
          chrome.storage.local.set({ timer: duration });
        });
      }
    });
  };

  const reset = () => {
    const duration =
      sessionType === 'focus' ? DEFAULT_FOCUS_DURATION : DEFAULT_BREAK_DURATION;
    setIsActive(false);
    setTimer(duration);
    chrome.storage.local.set({ timer: duration, isActive: false });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = `0${time % 60}`.slice(-2);
    return `${minutes}:${seconds}`;
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
