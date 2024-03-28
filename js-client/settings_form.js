var settingsForm = `
<form id="settings-form">
    <div id="asr-settings">
    <h2>--------asr setting--------</h2>

    <label for="min_chunk_size">min_chunk_size:</label>
    <input type="number" id="min_chunk_size" name="min_chunk_size" value="1">

    <label for="model">model:</label>
    <select id="model" name="model">
        <option value="medium">medium</option>
        <option value="large-v2">large-v2</option>
        <option value="large-v3" selected>large-v3</option>
        <option value="medium.en">medium.en</option>
    </select>

    <label for="lan">lan:</label>
    <input type="text" id="lan" name="lan" value="auto">

    <label for="task">task:</label>
    <select id="task" name="task">
        <option value="transcribe" selected>transcribe</option>
        <option value="translate">translate</option>
    </select>

    <label for="buffer_trimming">buffer_trimming:</label>
    <select id="buffer_trimming" name="buffer_trimming">
        <option value="sentence">sentence</option>
        <option value="segment" selected>segment</option>
    </select>

    <label for="buffer_trimming_sec">buffer_trimming_sec:</label>
    <input type="number" id="buffer_trimming_sec" name="buffer_trimming_sec" value="5">

    <label for="initial_prompt">initial_prompt:</label>
    <input type="text" id="initial_prompt" name="initial_prompt" value="">

    </div>
    <div id="subtitle-settings">
    <h2>--------subtitle setting--------</h2>

    <label for="font">font:</label>
    <select id="font" name="font">
        <option value="Arial" selected>Arial</option>
        <option value="Courier">Courier</option>
        <option value="Georgia">Georgia</option>
        <option value="Impact">Impact</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Verdana">Verdana</option>
    </select>

    <label for="font_size">font_size:</label>
    <input type="number" id="font_size" name="font_size" value="20">

    <label for="font_color">font_color:</label>
    <select id="font_color" name="font_color">
        <option value="black">black</option>
        <option value="white" selected>white</option>
        <option value="red">red</option>
        <option value="green">green</option>
        <option value="blue">blue</option>
        <option value="yellow">yellow</option>
        <option value="cyan">cyan</option>
        <option value="magenta">magenta</option>
    </select>

    <label for="font_transparency">font_transparency:</label>
    <input type="number" id="font_transparency" name="font_transparency" value="1">

    <label for="background_color">background_color:</label>
    <select id="background_color" name="background_color">
        <option value="black" selected>black</option>
        <option value="white">white</option>
        <option value="red">red</option>
        <option value="green">green</option>
        <option value="blue">blue</option>
        <option value="yellow">yellow</option>
        <option value="cyan">cyan</option>
        <option value="magenta">magenta</option>
    </select>

    <label for="background_transparency">background_transparency:</label>
    <input type="number" id="background_transparency" name="background_transparency" value="1">

    </div>
    <div id="server-settings">
    <h2>--------server setting--------</h2>

    <label for="ip">ip:</label>
    <input type="text" id="ip" name="ip" value="localhost">

    <label for="port">port:</label>
    <input type="number" id="port" name="port" value="8765">

    <input type="submit" value="Submit">
    </div>
</form>
`

function readSettingsForm() {
    let form = document.getElementById('asr-settings');
    let asr = {};
    for (let element of form.elements) {
        if (element.id) {
            asr[element.id] = element.value;
        }
    }
    form = document.getElementById('subtitle-settings');
    let subtitle = {};
    for (let element of form.elements) {
        if (element.id) {
            subtitle[element.id] = element.value;
        }
    }
    form = document.getElementById('server-settings');
    let server = {};
    for (let element of form.elements) {
        if (element.id) {
            server[element.id] = element.value;
        }
    }
    return { 'asr': asr, 'subtitle': subtitle, 'server': server };
}

function writeSettingsForm(dict) {
    let form = document.getElementById('asr-settings');
    for (let element of form.elements) {
        if (element.id && element.id in dict['asr']) {
            element.value = dict['asr'][element.id];
        }
    }
    form = document.getElementById('subtitle-settings');
    for (let element of form.elements) {
        if (element.id && element.id in dict['subtitle']) {
            element.value = dict['subtitle'][element.id];
        }
    }
    form = document.getElementById('server-settings');
    for (let element of form.elements) {
        if (element.id && element.id in dict['server']) {
            element.value = dict['server'][element.id];
        }
    }
}

function addSettingsFormElement() {
    let form = document.createElement('div');
    form.id = 'settings-form';
    form.innerHTML = settingsForm;
    form.style.position = 'fixed';
    form.style.right = '0px';
    form.style.top = '50%';
    form.style.transform = 'translateY(-50%)';
    form.style.zIndex = '100';
    form.style.display = 'none';
    // add close button
    let closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.position = 'absolute';
    closeButton.style.right = '0px';
    closeButton.style.top = '0px';
    closeButton.addEventListener('click', function () {
        form.style.display = 'none';
    });
    form.appendChild(closeButton);
    form.addEventListener('blur', function () {
        form.style.display = 'none';
    }, true);
    document.body.appendChild(form);
}

function showSettingsForm() {
    let form = document.getElementById('settings-form');
    if (!form) {
        addSettingsFormElement()
    }
    form.style.display = 'block';
}