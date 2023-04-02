// Populate the application info section within the sidebar. This should
// provide buttons to jump the camera to the location of the application
// in the world.

import * as scene from './scene.js';

var applicationInfoSidebarElement;

const geometryOptions = [
    "box",
    "capsule",
    "circle",
    "cone",
    "cylinder",
    "dodecahedron",
    "icosahedron",
    "octahedron",
    "plane",
    "ring",
    "sphere",
    "tetrahedron",
    "torus",
    "torusKnot"
];

// Filter variables
var filterInput;
var filterClearButton;
var filterText = '';

// Initialize the application info sidebar. Returns a promise that resolves
// when the sidebar has been initialized.
export function init() {
    return new Promise((resolve, reject) => {
        applicationInfoSidebarElement = document.getElementById('application-info-list');

        filterInput = document.getElementById('application-filter-input');
        filterClearButton = document.getElementById('application-filter-clear');

        resolve();
    });
}

// Start the application info sidebar. This should be called after the
// scene has been initialized.
export function start(applicationData) {
    filterInput.addEventListener('input', () => {
        filterText = filterInput.value;
        displayApplicationData(applicationData);
    });

    displayApplicationData(applicationData);
}

// Render the application info sidebar.
export function displayApplicationData(applicationData) {
    applicationInfoSidebarElement.innerHTML = '';

    for (let i = 0; i < applicationData.applications.length; i++) {
        let app = applicationData.applications[i];

        if (filterText != '' && !app.name.toLowerCase().includes(filterText.toLowerCase())) {
            continue;
        }

        let sectionElement = document.createElement('section');
        sectionElement.classList.add('info-box');
        sectionElement.style.setProperty('--box-color', app.color);

        let titleContainer = generateAppTitleElement(sectionElement, app, applicationData);
        
        let visibilityDataElement = generateVisibilityCheckboxElement(app, applicationData);
        let geometryDataElement = generateGeometryDropdownElement(app, applicationData);

        let serverNames = app.servers.map((server) => server.name);
        let serverDataElement = generatAppKListDataElement('Servers: ', serverNames);

        let positionVectorElement = generateVector3InputElements(app.position, applicationData, ["x", "y", "z"], 1);
        let positionDataElement = generateAppKVElementDataElement('Position: ', positionVectorElement);

        let rotationVectorElement = generateVector3InputElements(app.rotation, applicationData, ["x", "y", "z"], 1);
        let rotationDataElement = generateAppKVElementDataElement('Rotation: ', rotationVectorElement);

        let scaleVectorElement = generateVector3InputElements(app.scale, applicationData, ["x", "y", "z"], 1);
        let scaleDataElement = generateAppKVElementDataElement('Scale: ', scaleVectorElement);

        let jumpToButtonContainer = generateJumpToButtonElement(app);

        sectionElement.appendChild(titleContainer);
        sectionElement.appendChild(visibilityDataElement);
        sectionElement.appendChild(geometryDataElement);
        sectionElement.appendChild(serverDataElement);
        sectionElement.appendChild(positionDataElement);
        sectionElement.appendChild(rotationDataElement);
        sectionElement.appendChild(scaleDataElement);
        sectionElement.appendChild(jumpToButtonContainer);

        applicationInfoSidebarElement.appendChild(sectionElement);
    }
}

// Calculate the luma of a color passed in as a hex string.
function luma(color) {
    color = color.substring(1);
    color = parseInt(color, 16);
    let r = (color >> 16) & 0xff;
    let g = (color >>  8) & 0xff;
    let b = (color >>  0) & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Generate title bar element for the application info sidebar.
function generateAppTitleElement(infoBox, app, applicationData) {
    let titleContainer = document.createElement('div');
    titleContainer.classList.add('title-container');

    let nameElement = document.createElement('h2');
    nameElement.classList.add('title');
    nameElement.innerText = app.name;
    let l = luma(app.color);
    if (l < 60) {
        nameElement.classList.add('dark');
    }

    let colorDataElement = generateColorPickerElement(infoBox, app, applicationData);

    titleContainer.appendChild(nameElement);
    titleContainer.appendChild(colorDataElement);
    return titleContainer;
}

// Generate the color picker element for the application info sidebar.
function generateColorPickerElement(infoBox, app, applicationData) {
    let colorInput = document.createElement('input');
    colorInput.setAttribute('type', 'color');
    colorInput.defaultValue = app.color;
    colorInput.addEventListener('change', () => {
        app.color = colorInput.value;
        scene.resetApplications(applicationData);
        infoBox.style.setProperty('--box-color', app.color);
    });
    return colorInput;
}

// Generate a checkbox element to control the visibility of an application.
function generateVisibilityCheckboxElement(app, applicationData) {
    let checkboxElement = document.createElement('input');
    checkboxElement.setAttribute('type', 'checkbox');
    if (app.visible != null) {
        checkboxElement.checked = app.visible;
    } else {
        checkboxElement.checked = true;
    }
    checkboxElement.addEventListener('change', () => {
        app.visible = checkboxElement.checked;
        scene.resetApplications(applicationData);
    });
    let checkboxDataElement = generateAppKVElementDataElement('Visible: ', checkboxElement);
    return checkboxDataElement;
}

// Generate the dropdown menu for geometry selection.
function generateGeometryDropdownElement(app, applicationData) {
    let geometryDropdown = document.createElement('select');
    geometryDropdown.addEventListener('change', () => {
        app.geometry = geometryDropdown.value;
        scene.resetApplications(applicationData);
    });
    for (let i = 0; i < geometryOptions.length; i++) {
        let option = document.createElement('option');
        option.value = geometryOptions[i];
        option.innerText = geometryOptions[i];
        if (app.geometry == geometryOptions[i]) {
            option.selected = true;
        }
        geometryDropdown.appendChild(option);
    }
    let geometryDataElement = generateAppKVElementDataElement('Geometry: ', geometryDropdown);
    return geometryDataElement;
}

// Generate the jump to button for the application info sidebar.
function generateJumpToButtonElement(app) {
    let jumpToButtonContainer = document.createElement('div');
    let jumpToButton = document.createElement('button');
    jumpToButton.addEventListener('click', () => {
        let cameraPosition = [...app.position];
        cameraPosition[1] += 10;
        cameraPosition[2] += 10;
        scene.setCameraPosition(cameraPosition);
        scene.setCameraLookAt(app.position);
    });
    jumpToButton.innerText = 'Jump To';
    jumpToButtonContainer.appendChild(jumpToButton);
    return jumpToButtonContainer;
}

// General data element creation functions

// Generate a data element with a key and a value element.
// This function allows you to pass in a value element that
// is already created. This is useful for things like color
// pickers where you need to create the input element separately
// from the rest of the data element.
function generateAppKVElementDataElement(k, vElement) {
    let dataElement = document.createElement('div');
    dataElement.classList.add('info-box-kv');

    let titleElement = document.createElement('p');
    titleElement.classList.add('key');
    titleElement.innerText = k;

    dataElement.appendChild(titleElement);
    dataElement.appendChild(vElement);
    return dataElement;
}

// Generate a data element with a key and a value. k and v
// are both strings.
function generateAppKVDataElement(k, v) {
    let dataElement = document.createElement('div');
    dataElement.classList.add('info-box-kv');

    let titleElement = document.createElement('p');
    titleElement.classList.add('key');
    titleElement.innerText = k;

    let vElement = document.createElement('p');
    vElement.classList.add('value');
    vElement.innerText = v;

    dataElement.appendChild(titleElement);
    dataElement.appendChild(vElement);
    return dataElement;
}

// Generate a data element with a key and a list of values.
// k is a string and list is an array of strings.
function generatAppKListDataElement(k, list) {
    let dataElement = document.createElement('div');
    dataElement.classList.add('info-box-ul');
    let appListTitleElement = document.createElement('p');
    appListTitleElement.classList.add('key');
    appListTitleElement.innerText = k
    let ulElement = document.createElement('ul');
    ulElement.classList.add('value');
    for (let j = 0; j < list.length; j++) {
        let li = list[j];
        let liElement = document.createElement('li');
        liElement.innerText = li;
        ulElement.appendChild(liElement);
    }
    dataElement.appendChild(appListTitleElement);
    dataElement.appendChild(ulElement);
    return dataElement
}

// Generate number inputs for a vector3.
function generateVector3InputElements(vs, applicationData, labels, step = 1, min = null, max = null) {
    let container = document.createElement('div');
    container.classList.add('vector-input-container');

    for (let i = 0; i < labels.length; i++) {
        let value = vs[i];
        let label = labels[i];
        let onChange = (newValue) => {
            vs[i] = newValue;
            scene.resetApplications(applicationData);
        }
        let input = generateNumberInput(value, label, onChange, step, min, max);
        container.appendChild(input);
    }
    return container;
}

// Generate a single number input with a label.
function generateNumberInput(value, label, onChange, step = 1, min = null, max = null) {
    let container = document.createElement('div');
    container.classList.add('number-input-container');

    let labelElement = document.createElement('p');
    labelElement.innerText = label;

    let input = document.createElement('input');
    input.value = value;
    input.setAttribute('type', 'number');
    input.setAttribute('step', step);
    input.addEventListener('change', () => {
        onChange(input.value);
    });
    if (min != null) {
        input.setAttribute('min', min);
    }
    if (max != null) {
        input.setAttribute('max', max);
    }

    container.appendChild(labelElement);
    container.appendChild(input);
    return container;
}
