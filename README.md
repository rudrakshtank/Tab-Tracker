# Tab Tracker Extension

This is a Website Time Tracker extension with the following features:
- Website list used today
- A 7-day history 
- Combined today's chart and website list in a single tab

## Installation Instructions:

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
- lib/ - Chart.js library location (you need to download Chart.js)

## Note about Chart.js:
**You need to download Chart.js (chart.min.js) from the official CDN and place it in the lib/ folder for the charts to work properly.**
