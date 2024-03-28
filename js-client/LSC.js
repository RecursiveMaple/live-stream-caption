// ==UserScript==
// @name         Live Stream Caption
// @namespace    https://github.com/RecursiveMaple/live-stream-caption
// @version      2024-03-28
// @description  Frontend of live-stream-caption.
// @author       RecursiveMaple
// @match        https://www.twitch.tv/*
// @match        https://live.bilibili.com/*
// @icon         https://raw.githubusercontent.com/RecursiveMaple/live-stream-caption/master/js-client/icon.png
// @require      https://raw.githubusercontent.com/RecursiveMaple/live-stream-caption/master/js-client/get_video_element.js
// @require      https://raw.githubusercontent.com/RecursiveMaple/live-stream-caption/master/js-client/subtitle.js
// @require      https://raw.githubusercontent.com/RecursiveMaple/live-stream-caption/master/js-client/settings.js
// @grant        GM_registerMenuCommand
// ==/UserScript==

function main() {
  var videoElement = getVideoElement();
  var subtitle = new Subtitle("This is a subtitle", "24px", "rgba(0, 0, 0, 0.5)", "white");
  subtitle.addNextToVideo(videoElement);
  console.log("Live Stream Caption: Subtitle added");
}

(function () {
  "use strict";

  // add settings menu
  GM_registerMenuCommand("Settings", showLscSettings);

  // wait for video element to be ready
  var maxRetry = 30;
  var elemSearchCount = 0;
  var timer = setInterval(function () {
    elemSearchCount++;
    if (getVideoElement()) {
      console.log("Ready after", elemSearchCount, "tries");
      clearInterval(timer);
      main();
    } else if (elemSearchCount >= maxRetry) {
      console.log("Searching failed after", elemSearchCount, "tries");
      clearInterval(timer);
    }
  }, 500);
})();
