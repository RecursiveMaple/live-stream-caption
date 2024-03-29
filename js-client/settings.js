var settingsHtml = `
<div id="lsc-settings-asr">
  <h4>ASR Settings</h4>
  <div>
    <label for="min_chunk_size">min_chunk_size:</label>
    <input type="number" id="min_chunk_size" value="1" />
  </div>
  <div>
    <label for="model">model:</label>
    <select id="model">
      <option value="medium">medium</option>
      <option value="large-v2">large-v2</option>
      <option value="large-v3" selected>large-v3</option>
      <option value="medium.en">medium.en</option>
    </select>
  </div>
  <div>
    <label for="lan">lan:</label>
    <input type="text" id="lan" value="auto" />
  </div>
  <div>
    <label for="task">task:</label>
    <select id="task">
      <option value="transcribe" selected>transcribe</option>
      <option value="translate">translate</option>
    </select>
  </div>
  <div>
    <label for="buffer_trimming">buffer_trimming:</label>
    <select id="buffer_trimming">
      <option value="sentence">sentence</option>
      <option value="segment" selected>segment</option>
    </select>
  </div>
  <div>
    <label for="buffer_trimming_sec">buffer_trimming_sec:</label>
    <input type="number" id="buffer_trimming_sec" value="5" />
  </div>
  <div>
    <label for="initial_prompt">initial_prompt:</label>
    <input type="text" id="initial_prompt" value="" />
  </div>
</div>
<div id="lsc-settings-subtitle">
  <h4>Subtitle Settings</h4>
  <div>
    <label for="font">font:</label>
    <select id="font">
      <option value="Arial" selected>Arial</option>
      <option value="Courier">Courier</option>
      <option value="Georgia">Georgia</option>
      <option value="Impact">Impact</option>
      <option value="Times New Roman">Times New Roman</option>
      <option value="Verdana">Verdana</option>
    </select>
  </div>
  <div>
    <label for="font_size">font_size:</label>
    <input type="number" id="font_size" value="20" />
  </div>
  <div>
    <label for="font_color">font_color:</label>
    <input type="color" id="font_color" value="#FFFFFF" />
  </div>
  <div>
    <label for="font_transparency">font_transparency:</label>
    <input type="range" id="font_transparency" min="0" max="1" step="0.1" value="1" />
  </div>
  <div>
    <label for="background_color">background_color:</label>
    <input type="color" id="background_color" value="#000000" />
  </div>
  <div>
    <label for="background_transparency">background_transparency:</label>
    <input type="range" id="background_transparency" min="0" max="1" step="0.1" value="1" />
  </div>
</div>
<div id="lsc-settings-server">
  <h4>Server Settings</h4>
  <div>
    <label for="ip">ip:</label>
    <input type="text" id="ip" value="localhost" />
  </div>
  <div>
    <label for="port">port:</label>
    <input type="number" id="port" value="8765" />
  </div>
</div>
`;

var settingsCss = `
#lsc-settings {
  position: fixed;
  right: 0px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  background-color: white;
  border: 1px solid black;
  padding: 10px;
}
#lsc-settings > div {
  margin-bottom: 20px;
}
#lsc-settings h4 {
  font-size: 16px;
  margin-bottom: 10px;
}
#lsc-settings div > div {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
#lsc-settings label {
  flex: 1;
  text-align: left;
}
#lsc-settings input,
#lsc-settings select {
  flex: 1;
  text-align: right;
}
#lsc-settings button {
  position: absolute;
  right: 0px;
  top: 0px;
}
`;

function readLscSettings() {
  let settings = document.getElementById("lsc-settings-asr");
  let asr = {};
  for (let element of settings.elements) {
    if (element.id) {
      asr[element.id] = element.value;
    }
  }
  settings = document.getElementById("lsc-settings-subtitle");
  let subtitle = {};
  for (let element of settings.elements) {
    if (element.id) {
      subtitle[element.id] = element.value;
    }
  }
  settings = document.getElementById("lsc-settings-server");
  let server = {};
  for (let element of settings.elements) {
    if (element.id) {
      server[element.id] = element.value;
    }
  }
  return { asr: asr, subtitle: subtitle, server: server };
}

function writeLscSettings(dict) {
  let settings = document.getElementById("lsc-settings-asr");
  for (let element of settings.elements) {
    if (element.id && element.id in dict["asr"]) {
      element.value = dict["asr"][element.id];
    }
  }
  settings = document.getElementById("lsc-settings-subtitle");
  for (let element of settings.elements) {
    if (element.id && element.id in dict["subtitle"]) {
      element.value = dict["subtitle"][element.id];
    }
  }
  settings = document.getElementById("lsc-settings-server");
  for (let element of settings.elements) {
    if (element.id && element.id in dict["server"]) {
      element.value = dict["server"][element.id];
    }
  }
}

function addLscSettingsElement() {
  // add element
  let element = document.createElement("div");
  element.innerHTML = settingsHtml;
  element.id = "lsc-settings";
  element.style.display = "none";

  // add style
  let style = document.createElement('style');
  style.innerHTML = settingsCss;
  document.head.appendChild(style);

  // add close button
  let closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.addEventListener("click", function () {
    element.style.display = "none";
  });
  element.appendChild(closeButton);
  element.addEventListener(
    "blur",
    function () {
      element.style.display = "none";
    },
    true
  );
  document.body.appendChild(element);
}

function showLscSettings() {
  let settings = document.getElementById("lsc-settings");
  if (!settings) {
    addLscSettingsElement();
    settings = document.getElementById("lsc-settings");
  }
  settings.style.display = "block";
}

window.showLscSettings = showLscSettings;
window.readLscSettings = readLscSettings;
window.writeLscSettings = writeLscSettings;
