var settingsHtml = `
<button type="button" id="lsc-settings-close">Close</button>
<div id="lsc-settings-actions">
  <h4>Actions</h4>
  <div>
    <button type="button" id="reload">reload</button>
    <label for="server_status">server:</label>
    <input type="text" id="server_status" readonly />
  </div>
  <div>
    <button type="button" id="get_quality">get quality</button>
    <select id="live_quality"></select>
  </div>
  <div>
    <button type="button" id="start">start</button>
    <button type="button" id="stop">stop</button>
  </div>
</div>
<div id="lsc-settings-asr">
  <h4>ASR Settings</h4>
  <div>
    <label for="min_chunk_size">min_chunk_size:</label>
    <input type="number" id="min_chunk_size" step="0.1" />
  </div>
  <div>
    <label for="model">model:</label>
    <select id="model">
      <option value="medium">medium</option>
      <option value="large-v2">large-v2</option>
      <option value="large-v3">large-v3</option>
      <option value="medium.en">medium.en</option>
    </select>
  </div>
  <div>
    <label for="lan">lan:</label>
    <input type="text" id="lan" />
  </div>
  <div>
    <label for="task">task:</label>
    <select id="task">
      <option value="transcribe">transcribe</option>
      <option value="translate">translate</option>
    </select>
  </div>
  <div>
    <label for="buffer_trimming">buffer_trimming:</label>
    <select id="buffer_trimming">
      <option value="sentence">sentence</option>
      <option value="segment">segment</option>
    </select>
  </div>
  <div>
    <label for="buffer_trimming_sec">buffer_trimming_sec:</label>
    <input type="number" id="buffer_trimming_sec" />
  </div>
  <div>
    <label for="initial_prompt">initial_prompt:</label>
    <input type="text" id="initial_prompt" />
  </div>
</div>
<div id="lsc-settings-caption">
  <h4>Caption Settings</h4>
  <div>
    <label for="font">font:</label>
    <select id="font">
      <option value="Monospaced Serif">Monospaced Serif</option>
      <option value="Proportional Serif">Proportional Serif</option>
      <option value="Monospaced Sans-Serif">Monospaced Sans-Serif</option>
      <option value="Proportional Sans-Serif">Proportional Sans-Serif</option>
      <option value="Casua">Casua</option>
      <option value="Cursive">Cursive</option>
      <option value="Small Capitals">Small Capitals</option>
    </select>
  </div>
  <div>
    <label for="font_size">font_size:</label>
    <input type="number" id="font_size" />
  </div>
  <div>
    <label for="font_color">font_color:</label>
    <input type="color" id="font_color" />
  </div>
  <div>
    <label for="font_transparency">font_transparency:</label>
    <input type="range" id="font_transparency" min="0" max="1" step="0.1" />
  </div>
  <div>
    <label for="background_color">background_color:</label>
    <input type="color" id="background_color" />
  </div>
  <div>
    <label for="background_transparency">background_transparency:</label>
    <input type="range" id="background_transparency" min="0" max="1" step="0.1" />
  </div>
</div>
<div id="lsc-settings-server">
  <h4>Server Settings</h4>
  <div>
    <label for="ip">ip:</label>
    <input type="text" id="ip" />
  </div>
  <div>
    <label for="port">port:</label>
    <input type="number" id="port" />
  </div>
</div>
`;

var settingsCss = `
#lsc-settings {
  position: fixed;
  right: 0px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  background-color: white;
  border: 1px solid black;
  padding: 10px;
  overflow: auto;
  max-height: 80vh;
}
#lsc-settings button {
  border: solid;
  border-radius: 3px;
  border-width: 1px;
  border-color: gray;
  background: lightgray;
  position: absolute;
}
#lsc-settings button:active {
  background: darkgray;
}
#lsc-settings-close {
  right: 10px;
  top: 10px;
}
#lsc-settings h4 {
  text-align: center;
}
#lsc-settings div {
  margin-bottom: 10px;
}
#lsc-settings div > div {
  display: flex;
  justify-content: space-between;
}
#lsc-settings label {
  flex: 1;
  text-align: left;
}
#lsc-settings input,
#lsc-settings select{
  flex: 1;
  text-align: right;
}
#lsc-settings-actions button {
  flex: 1;
  text-align: center;
  position: relative;
  margin-right: 10px;
}
`;

var defaultSettings = {
  asr: {
    min_chunk_size: 1,
    model: "large-v3",
    lan: "auto",
    task: "transcribe",
    buffer_trimming: "segment",
    buffer_trimming_sec: 5,
    initial_prompt: "",
  },
  caption: {
    font: "Arial",
    font_size: 20,
    font_color: "#FFFFFF",
    font_transparency: 1,
    background_color: "#000000",
    background_transparency: 1,
  },
  server: {
    ip: "localhost",
    port: 8765,
  },
};

function readLscSettings() {
  let elements = document.getElementById("live_quality");
  let asr = {};
  if (elements.value) {
    asr["live_quality"] = elements.value;
  }
  let settings = document.getElementById("lsc-settings-asr");
  elements = settings.querySelectorAll("input, select");
  for (let element of elements) {
    if (element.id) {
      asr[element.id] = element.value;
    }
  }
  settings = document.getElementById("lsc-settings-caption");
  let caption = {};
  elements = settings.querySelectorAll("input, select");
  for (let element of elements) {
    if (element.id) {
      caption[element.id] = element.value;
    }
  }
  settings = document.getElementById("lsc-settings-server");
  let server = {};
  elements = settings.querySelectorAll("input, select");
  for (let element of elements) {
    if (element.id) {
      server[element.id] = element.value;
    }
  }
  return { asr: asr, caption: caption, server: server };
}

function writeLscSettings(dict) {
  let elements = document.getElementById("live_quality");
  if (dict["asr"]["live_quality"]) {
    if (elements.options.length > 0) {
      elements.value = dict["asr"]["live_quality"];
    } else {
      let newOption = document.createElement("option");
      newOption.value = dict["asr"]["live_quality"];
      newOption.text = dict["asr"]["live_quality"];
      elements.add(newOption);
      elements.value = dict["asr"]["live_quality"];
    }
  }
  let settings = document.getElementById("lsc-settings-asr");
  elements = settings.querySelectorAll("input, select");
  for (let element of elements) {
    if (element.id && element.id in dict["asr"]) {
      element.value = dict["asr"][element.id];
    }
  }
  settings = document.getElementById("lsc-settings-caption");
  elements = settings.querySelectorAll("input, select");
  for (let element of elements) {
    if (element.id && element.id in dict["caption"]) {
      element.value = dict["caption"][element.id];
    }
  }
  settings = document.getElementById("lsc-settings-server");
  elements = settings.querySelectorAll("input, select");
  for (let element of elements) {
    if (element.id && element.id in dict["server"]) {
      element.value = dict["server"][element.id];
    }
  }
}

function getAsrArgs() {
  let settings = readLscSettings();
  let args = [];
  for (let key in settings.asr) {
    args.push("--" + key);
    args.push(settings.asr[key]);
  }
  return args;
}

function addLscSettingsElement() {
  // add element
  let element = document.createElement("div");
  element.innerHTML = settingsHtml;
  element.id = "lsc-settings";
  element.style.display = "none";

  // add style
  let style = document.createElement("style");
  style.innerHTML = settingsCss;
  document.head.appendChild(style);

  // add element to body
  document.body.appendChild(element);

  // add close button listener
  let closeButton = document.getElementById("lsc-settings-close");
  closeButton.addEventListener("click", function () {
    element.style.display = "none";
  });

  // add auto close listener
  document.addEventListener("click", function (event) {
    if (!element.contains(event.target)) {
      element.style.display = "none";
    }
  });

  // add input listeners
  let fontTransparencyInput = document.getElementById("font_transparency");
  fontTransparencyInput.addEventListener("input", function () {
    this.title = this.value;
  });
  let backgroundTransparencyInput = document.getElementById("background_transparency");
  backgroundTransparencyInput.addEventListener("input", function () {
    this.title = this.value;
  });

  // write default settings
  writeLscSettings(defaultSettings);

  return element;
}

function showLscSettings() {
  let settings = document.getElementById("lsc-settings");
  if (!settings) {
    settings = addLscSettingsElement();
  }
  settings.style.display = "block";
}

function updateServerStatus(text) {
  let serverStatusElement = document.getElementById("server_status");
  if (serverStatusElement) {
    serverStatusElement.value = text;
  }
}

function setQualityOptions(optionsList, defaultOption) {
  let selectElement = document.getElementById("live_quality");
  if (!selectElement) {
    return;
  }
  selectElement.innerHTML = "";
  optionsList.forEach(function (option) {
    let optElement = document.createElement("option");
    optElement.value = option;
    optElement.text = option;
    selectElement.appendChild(optElement);
  });
  // 设置默认选项
  selectElement.value = defaultOption;
}

window.showLscSettings = showLscSettings;
window.readLscSettings = readLscSettings;
window.writeLscSettings = writeLscSettings;
window.getAsrArgs = getAsrArgs;
window.addLscSettingsElement = addLscSettingsElement;
window.updateServerStatus = updateServerStatus;
window.setQualityOptions = setQualityOptions;
