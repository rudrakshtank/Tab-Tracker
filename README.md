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

## 📁 Files Included

| File | Description |
|------|-------------|
| `background.js` | Background script that tracks tab activity and website usage time. |
| `chart.min.js` | Minified Chart.js library used to visualize usage statistics. |
| `icon16.png`, `icon48.png` | Icons used for the extension in toolbar and menus. |
| `manifest.json` | Defines the extension's configuration, permissions, and scripts. |
| `popup.html` | Structure of the popup interface displayed on clicking the extension. |
| `popup.css` | Stylesheet that defines the appearance of the popup UI. |
| `popup.js` | Controls the logic and data rendering in the popup, including charts. |

## Note about Chart.js:
**You need to download Chart.js (chart.min.js) from the official CDN and place it in the lib/ folder for the charts to work properly.**
