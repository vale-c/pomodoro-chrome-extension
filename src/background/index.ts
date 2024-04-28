import { DEFAULT_FOCUS_DURATION, DEFAULT_BREAK_DURATION } from '../constants';

chrome.runtime.onInstalled.addListener(initializeTimer);
chrome.runtime.onStartup.addListener(initializeTimer);

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
  periodInMinutes: 1 / 60,
});

chrome.alarms.onAlarm.addListener(updateTimer);

function updateTimer(): void {
  chrome.storage.local.get(['timer', 'isActive', 'sessionType'], (result) => {
    if (result.isActive) {
      const newTimer = result.timer - 1;
      if (newTimer <= 0) {
        const nextSessionType = result.sessionType === 'focus' ? 'break' : 'focus';
        chrome.storage.local.set({
          sessionType: nextSessionType,
          timer: nextSessionType === 'focus' ? DEFAULT_FOCUS_DURATION : DEFAULT_BREAK_DURATION,
          isActive: false,  // Ensure the timer does not continue automatically
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
      break;
    case 'resetTimer':
      resetTimer();
      break;
  }
  sendResponse({});
  return true;
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
