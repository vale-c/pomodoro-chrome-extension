import { DEFAULT_FOCUS_DURATION, DEFAULT_BREAK_DURATION } from '../constants';

chrome.runtime.onInstalled.addListener(() => {
  initializeTimer();
});

chrome.runtime.onStartup.addListener(() => {
  initializeTimer();
});

function initializeTimer(): void {
  chrome.storage.local.get(['timer', 'isActive', 'sessionType'], (result) => {
    if (!result.sessionType) {
      // Set initial values if not yet set
      chrome.storage.local.set({
        timer: DEFAULT_FOCUS_DURATION,
        isActive: false,
        sessionType: 'focus',
      });
    }
  });
}

chrome.alarms.create('pomodoroTimer', {
  when: Date.now(),
  periodInMinutes: 1 / 60, // Update every second
});

chrome.alarms.onAlarm.addListener(() => {
  updateTimer();
});

function updateTimer(): void {
  chrome.storage.local.get(['timer', 'isActive', 'sessionType'], (result) => {
    if (result.isActive) {
      const newTimer = result.timer - 1;
      if (newTimer <= 0) {
        // Time to switch sessions
        const isFocusSession = result.sessionType === 'focus';
        const nextSessionType = isFocusSession ? 'break' : 'focus';
        const nextTimerDuration = isFocusSession
          ? DEFAULT_BREAK_DURATION
          : DEFAULT_FOCUS_DURATION;

        chrome.storage.local.set({
          sessionType: nextSessionType,
          timer: nextTimerDuration,
          isActive: true, // Continue the timer if it was active
        });
      } else {
        // Update the timer with the decremented value
        chrome.storage.local.set({ timer: newTimer });
      }
    }
  });
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.command) {
    case 'toggleTimer':
      toggleTimer();
      sendResponse({ status: 'Timer toggled' });
      break;
    case 'resetTimer':
      resetTimer();
      sendResponse({ status: 'Timer reset successfully' });
      break;
    default:
      sendResponse({ error: 'Unknown command' });
      break;
  }
  return true; // return true to indicate you wish to send a response asynchronously
});

function toggleTimer(): void {
  chrome.storage.local.get(['isActive'], (result) => {
    chrome.storage.local.set({ isActive: !result.isActive });
  });
}

function resetTimer(): void {
  chrome.storage.local.set({
    timer: DEFAULT_FOCUS_DURATION,
    isActive: false,
    sessionType: 'focus',
  });
}


