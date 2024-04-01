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
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

function wsOnMessage(e) {
  let message = JSON.parse(e.data);
  if (message.cmd === "quality") {
    let qualityList = message.data;
    let defaultQuality = document.getElementById("quality_options").value;
    setQualityOptions(qualityList, defaultQuality);
  }
}
var ws = null;
function setupClient() {
  if (!(ws && ws.readyState === WebSocket.CLOSED)) {
    ws.close();
  }
  let settings = readLscSettings();
  ws = new WebSocket(`ws://${settings.server.ip}:${settings.server.port}`);

  ws.onopen = function () {
    console.log("WebSocket Client Connected");
    updateServerStatus("OPEN");
  };

  ws.onmessage = function (e) {
    console.log("Received: '" + e.data + "'");
    wsOnMessage(e);
  };

  ws.onerror = function (e) {
    console.log("WebSocket encountered error: ", e.message, "Closing socket");
  };

  ws.onclose = function (e) {
    if (e.wasClean) {
      console.log(`WebSocket connection closed cleanly, code=${e.code}, reason=${e.reason}`);
    } else {
      console.log("WebSocket connection died");
    }
    updateServerStatus("CLOSED");
  };
}
function queryQuality() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    let message = {
      ts: Date.now(),
      cmd: "quality",
      data: "",
    };
    ws.send(JSON.stringify(message));
  }
}
function main() {
  var videoElement = getVideoElement();
  var subtitle = new Subtitle("This is a subtitle", "24px", "rgba(0, 0, 0, 0.5)", "white");
  subtitle.attachToVideo(videoElement);
  console.log("Live Stream Caption: Subtitle added");
}

function saveSettings(settings) {
  let url = window.location.href;
  let savedValue = GM_getValue("lscSettings");
  if (savedValue) {
    let dict = JSON.parse(savedValue);
    dict["subtitle"] = settings["subtitle"];
    dict["server"] = settings["server"];
    dict["asr"][url] = settings["asr"];
    GM_setValue("lscSettings", JSON.stringify(dict));
  } else {
    settings["asr"] = { [url]: settings["asr"] };
    GM_setValue("lscSettings", JSON.stringify(settings));
  }
}

function loadSettings() {
  let url = window.location.href;
  let savedValue = GM_getValue("lscSettings");
  if (savedValue) {
    let dict = JSON.parse(savedValue);
    if (dict["asr"] && dict["asr"][url]) {
      return dict;
    }
  } else {
    GM_setValue("lscSettings", JSON.stringify(defaultSettings));
  }
  return null;
}

function setupSettingsMenu() {
  // add settings menu
  GM_registerMenuCommand("Settings", showLscSettings);
  let settingsElement = addLscSettingsElement();
  let inputElements = settingsElement.querySelectorAll("input, select");
  inputElements.forEach(function (element) {
    if (element.id) {
      element.addEventListener("change", function () {
        let settings = readLscSettings();
        GM_setValue("lscSettings", JSON.stringify(settings));
        console.log("Settings saved");
      });
      // setup server connection
      if (element.id === "ip" || element.id === "port") {
        element.addEventListener("change", setupClient);
      }
    }
  });

  let getQualityButton = document.getElementById("get_quality");
  getQualityButton.addEventListener("click", queryQuality);

  // load settings
  let savedValue = GM_getValue("lscSettings");
  if (savedValue) {
    writeLscSettings(JSON.parse(savedValue));
  } else {
    GM_setValue("lscSettings", JSON.stringify(defaultSettings));
  }
}

(function () {
  "use strict";

  setupSettingsMenu();

  setupClient();

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
