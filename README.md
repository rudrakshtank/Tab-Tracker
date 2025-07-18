# Tab Tracker Extension

It is a minimal Chrome extension that monitors how much time you spend on each website, helping you identify distractions and stay productive throughout the day.

## ✨ Features
- Websites used today
- A 7-day history 
- Combined today's usage chart and website list (with individual chart)

## 📥 Installation Instructions:

1. Download Chart.js library from https://cdn.jsdelivr.net/npm/chart.js and all the files of this repository
2. Save it as `lib/chart.min.js` in the extension folder
3. Open Chrome and go to chrome://extensions/
4. Enable "Developer mode"
5. Click "Load unpacked" and select this folder

## Files included:
- manifest.json - Extension configuration
- background.js - Background service worker for time tracking
- popup.html - Extension popup interface
- popup.css - Styling for the interface
- popup.js - Frontend JavaScript logic
- icons - Extension icons (basic placeholders)
- chart.min.js - Chart.js library (you need to download Chart.js)

## Note about Chart.js:
**You need to download Chart.js (chart.min.js) from the official CDN and place it in the lib/ folder for the charts to work properly.**
