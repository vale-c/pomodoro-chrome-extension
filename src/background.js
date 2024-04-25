import { DEFAULT_FOCUS_DURATION } from './constants.ts';

/* global chrome */
chrome.alarms.create('pomodoroTimer', {
  periodInMinutes: 1 / 60,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer') {
    chrome.storage.local.get(['timer', 'isActive'], (result) => {
      if (result.isActive) {
        let timer = result.timer || DEFAULT_FOCUS_DURATION; // Default is 25 minutes
        timer -= 1;
        if (timer <= 0) {
          timer = 0;
          chrome.action.setBadgeText({ text: 'Done' });
          // Pause the timer
          chrome.storage.local.set({ isActive: false });
        } else {
          chrome.action.setBadgeText({ text: `${Math.ceil(timer / 60)}m` });
        }
        chrome.storage.local.set({ timer });
      }
    });
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.storage.local.get(['isActive'], (result) => {
    const newIsActive = !result.isActive;
    chrome.storage.local.set({ isActive: newIsActive });

    if (newIsActive) {
      chrome.storage.local.get(['timer'], (res) => {
        if (!res.timer) {
          // Reset timer if not previously set
          chrome.storage.local.set({ timer: DEFAULT_FOCUS_DURATION });
        }
      });
    }
  });
});
