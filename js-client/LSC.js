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
// @require      https://raw.githubusercontent.com/RecursiveMaple/live-stream-caption/master/js-client/caption.js
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
    console.debug("ASR:", t0, t1, text);
    if (caption) {
      caption.pushText(text);
    }
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
    console.debug("query quality for url:", url);
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
    console.debug("Start ASR with args:", args.join(" "));
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
    console.debug("Stop ASR");
  }
}

var ws = null;
function setupClient() {
  if (ws && ws.readyState != WebSocket.CLOSED) {
    ws.close();
  }
  let settings = loadSettings();
  ws = new WebSocket(`wss://${settings.server.ip}:${settings.server.port}`);

  ws.onopen = function () {
    console.debug("WebSocket Client Connected");
    updateServerStatus("OPEN");
  };

  ws.onmessage = function (e) {
    // console.debug("Received: '" + e.data + "'");
    wsOnMessage(e);
  };

  ws.onerror = function (e) {
    console.debug("WebSocket encountered error: ", e.error, "Closing socket");
  };

  ws.onclose = function (e) {
    if (e.wasClean) {
      console.debug(`WebSocket connection closed cleanly, code=${e.code}, reason=${e.reason}`);
    } else {
      console.debug("WebSocket connection died");
    }
    updateServerStatus("CLOSED");
  };
}

function saveSettings(settings) {
  let savedValue = GM_getValue("lscSettings");
  if (savedValue) {
    let dict = JSON.parse(savedValue);
    dict["asr"][url] = settings["asr"];
    dict["caption"] = settings["caption"];
    dict["server"] = settings["server"];
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
    if (dict["asr"][url]) {
      return { asr: dict["asr"][url], caption: dict["caption"], server: dict["server"] };
    } else {
      return { asr: defaultSettings["asr"], caption: dict["caption"], server: dict["server"] };
    }
  }
  return defaultSettings;
}

function setupSettingsMenu() {
  // add settings menu
  GM_registerMenuCommand("Settings", showLscSettings);
  let settingsElement = addLscSettingsElement();
  let inputElements = settingsElement.querySelectorAll("input, select");
  inputElements.forEach(function (element) {
    if (element.id) {
      element.addEventListener("change", function () {
        saveSettings(readLscSettings());
        console.debug("Settings saved");
      });
      // setup server connection
      if (settingsGroup.server.includes(element.id)) {
        element.addEventListener("change", setupClient);
      }
      if (settingsGroup.caption.includes(element.id)) {
        element.addEventListener("change", setupCaption);
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
  writeLscSettings(loadSettings());
}

var caption = null;
function setupCaption() {
  let maxRetry = 30;
  let elemSearchCount = 0;
  let elemTimer = setInterval(function () {
    elemSearchCount++;
    if (getVideoElement()) {
      console.debug("VideoElement ready after", elemSearchCount, "tries");
      clearInterval(elemTimer);
      if (caption) {
        caption.updateStyle(loadSettings().caption);
        caption.pushText(caption.defaultText);
      } else {
        caption = addCaption(getVideoElement(), loadSettings().caption);
      }
    } else if (elemSearchCount >= maxRetry) {
      console.debug("VideoElement searching failed after", elemSearchCount, "tries");
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
      console.debug("URL changed to", newUrl);
      url = newUrl;
      // wsStopAsr();
      setupCaption();
    }
  }, 5000);

  setupSettingsMenu();

  setupClient();

  setupCaption();
})();
