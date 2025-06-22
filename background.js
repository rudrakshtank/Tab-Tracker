let activeTabInfo = {
  tabId: null,
  startTime: null,
  url: null
};

chrome.runtime.onStartup.addListener(startTracking);
chrome.runtime.onInstalled.addListener(startTracking);

function startTracking() {
  chrome.alarms.create('update-time', { periodInMinutes: 1 });
  updateActiveTab();
}

chrome.tabs.onActivated.addListener(activeInfo => {
  handleTabChange(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabInfo.tabId && changeInfo.url) {
    handleTabChange(tabId);
  }
});

chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    recordTime();
    activeTabInfo.url = null; 
  } 
  else {
    updateActiveTab();
  }
});

chrome.idle.onStateChanged.addListener(newState => {
  if (newState === 'active') {
    updateActiveTab();
  } 
  else {
    recordTime();
    activeTabInfo.url = null; 
  }
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'update-time') {
    recordTime();
    updateActiveTab();
    checkForDateChange();
  }
});

async function handleTabChange(tabId) {
  await recordTime();
  activeTabInfo.tabId = tabId;
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (tab && tab.url && (tab.url.startsWith('http') || tab.url.startsWith('file'))) {
    activeTabInfo.url = tab.url;
    activeTabInfo.startTime = Date.now();
  } else {
    activeTabInfo.url = null;
  }
}

async function updateActiveTab() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab) {
    handleTabChange(activeTab.id);
  } else {
    recordTime();
    activeTabInfo.url = null;
  }
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } 
  catch (e) {
    return null;
  }
}

async function recordTime() {
    if (!activeTabInfo.url || !activeTabInfo.startTime) {
        return;
    }

    const hostname = getHostname(activeTabInfo.url);
    if (!hostname) {
        return;
    }

    const endTime = Date.now();
    const secondsSpent = Math.round((endTime - activeTabInfo.startTime) / 1000);
    activeTabInfo.startTime = endTime;

    if (secondsSpent <= 0) {
        return;
    }

    const data = await chrome.storage.local.get(['today', 'weeklyHistory', 'allSites']);
    const todayStr = new Date().toISOString().slice(0, 10);

    const today = data.today && data.today.date === todayStr ? data.today : { date: todayStr, totalTime: 0, sites: {} };
    const weeklyHistory = data.weeklyHistory || {};
    const allSites = data.allSites || {};

    today.totalTime += secondsSpent;
    today.sites[hostname] = (today.sites[hostname] || 0) + secondsSpent;

    if (!allSites[hostname]) {
        allSites[hostname] = { totalTime: 0, lastVisited: todayStr, dailyUsage: {} };
    }
    allSites[hostname].totalTime += secondsSpent;
    allSites[hostname].lastVisited = todayStr;
    allSites[hostname].dailyUsage[todayStr] = (allSites[hostname].dailyUsage[todayStr] || 0) + secondsSpent;

    await chrome.storage.local.set({ today, weeklyHistory, allSites });
}

async function checkForDateChange() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const data = await chrome.storage.local.get(['today', 'weeklyHistory']);

  if (data.today && data.today.date !== todayStr) {
    const yesterdayStr = data.today.date;
    const yesterdayTime = data.today.totalTime;

    const weeklyHistory = data.weeklyHistory || {};
    weeklyHistory[yesterdayStr] = yesterdayTime;

    const sortedDates = Object.keys(weeklyHistory).sort((a, b) => new Date(b) - new Date(a));
    const cleanedHistory = {};
    for (let i = 0; i < Math.min(7, sortedDates.length); i++) {
        const date = sortedDates[i];
        cleanedHistory[date] = weeklyHistory[date];
    }

    await chrome.storage.local.set({
      today: { date: todayStr, totalTime: 0, sites: {} },
      weeklyHistory: cleanedHistory
    });
  }
}

startTracking();