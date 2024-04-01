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
    let defaultQuality = document.getElementById("live_quality").value;
    setQualityOptions(qualityList, defaultQuality);
  } else if (message.cmd === "start") {
    let out = message.data;
    [t0, t1, text] = out;
    console.log("ASR:", t0, t1, text);
  }
}
function wsQueryQuality() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    let message = {
      ts: Date.now(),
      cmd: "quality",
      data: url,
    };
    ws.send(JSON.stringify(message));
    console.log("query quality for url:", url);
  }
}
function wsStartAsr() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    let args = getAsrArgs();
    args.push("--live_url");
    args.push(url);
    let message = {
      ts: Date.now(),
      cmd: "start",
      data: args,
    };
    ws.send(JSON.stringify(message));
    console.log("Start ASR with args:", args.join(" "));
  }
}
function wsStopAsr() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    let message = {
      ts: Date.now(),
      cmd: "stop",
      data: "",
    };
    ws.send(JSON.stringify(message));
    console.log("Stop ASR");
  }
}

var ws = null;
function setupClient() {
  if (ws && ws.readyState != WebSocket.CLOSED) {
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
//! change func name
function main() {
  let videoElement = getVideoElement();
  let subtitle = new Subtitle("This is a subtitle", "24px", "rgba(0, 0, 0, 0.5)", "white");
  subtitle.attachToVideo(videoElement);
  console.log("Live Stream Caption: Subtitle added");
}

function saveSettings(settings) {
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

  // add event listener for button
  let reloadButton = document.getElementById("reload");
  reloadButton.addEventListener("click", setupClient);
  let getQualityButton = document.getElementById("get_quality");
  getQualityButton.addEventListener("click", wsQueryQuality);
  let startAsrButton = document.getElementById("start");
  startAsrButton.addEventListener("click", wsStartAsr);
  let stopAsrButton = document.getElementById("stop");
  stopAsrButton.addEventListener("click", wsStopAsr);

  // load settings
  let savedValue = GM_getValue("lscSettings");
  if (savedValue) {
    writeLscSettings(JSON.parse(savedValue));
  } else {
    GM_setValue("lscSettings", JSON.stringify(defaultSettings));
  }
}

function setupSubtitle() {
  let maxRetry = 30;
  let elemSearchCount = 0;
  let elemTimer = setInterval(function () {
    elemSearchCount++;
    if (getVideoElement()) {
      console.log("VideoElement ready after", elemSearchCount, "tries");
      clearInterval(elemTimer);
      main();
    } else if (elemSearchCount >= maxRetry) {
      console.log("VideoElement Searching failed after", elemSearchCount, "tries");
      clearInterval(elemTimer);
    }
  }, 500);
}

var url = null;

(function () {
  "use strict";

  // check if url changed
  url = window.location.href;
  setInterval(function () {
    let newUrl = window.location.href;
    if (newUrl !== url) {
      console.log("URL changed to", newUrl);
      url = newUrl;
      // wsStopAsr();
      setupSubtitle();
    }
  }, 5000);

  setupSettingsMenu();

  setupClient();

  setupSubtitle();
})();
