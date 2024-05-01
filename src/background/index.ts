// Import constants and make sure they are accessible
import { DEFAULT_FOCUS_DURATION, DEFAULT_BREAK_DURATION } from '../constants';

const updateTimer = () => {
  chrome.storage.local.get(['timer', 'isActive', 'sessionType'], (result) => {
    if (result.isActive) {
      const newTimer = result.timer - 1;
      chrome.action.setBadgeText({ text: formatTime(newTimer) });

      if (newTimer <= 0) {
        // Session has ended, reset the timer but do not set it as active.
        const nextSessionType = result.sessionType === 'focus' ? 'break' : 'focus';
        chrome.storage.local.set({
          sessionType: nextSessionType,
          timer: nextSessionType === 'focus' ? DEFAULT_FOCUS_DURATION : DEFAULT_BREAK_DURATION,
          isActive: false, // Do not automatically start the next session
        });
        chrome.action.setBadgeText({ text: 'Done' });
      } else {
        // Update the timer continuously
        chrome.storage.local.set({ timer: newTimer });
      }
    } else {
      chrome.action.setBadgeText({ text: '' }); // Clear badge text when the timer is not active
    }
  });
};

/**
 * Initialize the timer with default values if they don't already exist.
 */
const initializeTimer = () => {
  chrome.storage.local.get(['timer', 'isActive', 'sessionType'], (result) => {
    if (!result.sessionType) {
      // Set initial timer settings if not set
      chrome.storage.local.set({
        timer: DEFAULT_FOCUS_DURATION,
        isActive: false,
        sessionType: 'focus',
      });
    }
  });
}

chrome.alarms.create('pomodoroTimer', { periodInMinutes: 1 / 60 });
chrome.alarms.onAlarm.addListener(updateTimer);

// chrome.runtime.onInstalled.addListener(initializeTimer);
chrome.runtime.onStartup.addListener(initializeTimer);

export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = `0${time % 60}`.slice(-2);
  return `${minutes}:${seconds}`;
};
