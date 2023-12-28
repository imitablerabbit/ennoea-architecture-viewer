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
var filterText = '';

/**
 * Initializes the application info sidebar.
 * 
 * @param {Object} archController - The architecture controller object.
 * @returns {Promise} A promise that resolves when the initialization is complete.
 */
export function init(archController) {
    return new Promise((resolve, reject) => {
        applicationInfoSidebarElement = document.getElementById('application-info-list');

        filterInput = document.getElementById('application-filter-input');
        filterInput.addEventListener('input', () => {
            filterText = filterInput.value;
            let architectureData = archController.getArchitectureState();
            displayArchitectureData(archController, architectureData);
        });

        // Subscribe to the archController for notifications
        archController.subscribe((architectureData) => {
            displayArchitectureData(archController, architectureData);
        });

        resolve();
    });
}

/**
 * Displays the architecture data in the application info sidebar.
 * 
 * @param {Object} archController - The architecture controller object.
 * @param {Object} architectureData - The architecture data object.
 */
export function displayArchitectureData(archController, architectureData) {
    applicationInfoSidebarElement.innerHTML = '';

    for (let i = 0; i < architectureData.components.length; i++) {
        let component = architectureData.components[i];
        if (filterText != '' && !component.name.toLowerCase().includes(filterText.toLowerCase())) {
            continue;
        }

        let updateComponent = function (newComponent) {
            architectureData.components[i] = newComponent;
            archController.setArchitectureState(architectureData);
        }
        let sectionElement = generateComponentElement(component, updateComponent);
        applicationInfoSidebarElement.appendChild(sectionElement);
    }
}

/**
 * Generates a component element for the sidebar application info.
 * 
 * We only need to update the color of the component.
 * There is no need to update the view as this is handled
 * by the architecture controller.
 * 
 * @param {Object} component - The component object.
 * @param {Function} update - The update function to be called when the component is updated.
 * @returns {HTMLElement} - The generated section element.
 */
function generateComponentElement(component, update) {
    let sectionElement = document.createElement('section');
    sectionElement.classList.add('info-box');
    sectionElement.style.setProperty('--box-color', component.object.color);

    let object = component.object;

    let titleUpdate = function(newColor) {
        component.object.color = newColor;
        update(component);
    }
    let titleContainer = generateAppTitleElement(component.name, object.color, titleUpdate);
    
    let visibleUpdate = function(newVisible) {
        component.object.visible = newVisible;
        update(component);
    }
    let visibilityDataElement = generateVisibilityCheckboxElement(object.visible, visibleUpdate);

    let geometryUpdate = function(newGeometry) {
        component.object.geometry = newGeometry;
        update(component);
    }
    let geometryDataElement = generateGeometryDropdownElement(object.geometry, geometryUpdate);

    let positionUpdate = function(newPosition) {
        component.object.position = newPosition;
        update(component);
    }
    let positionVectorElement = generateVector3InputElements(object.position, ["x", "y", "z"], positionUpdate, 1);
    let positionDataElement = generateAppKVElementDataElement('Position: ', positionVectorElement);

    let rotationUpdate = function(newRotation) {
        component.object.rotation = newRotation;
        update(component);
    }
    let rotationVectorElement = generateVector3InputElements(object.rotation, ["x", "y", "z"], rotationUpdate, 1);
    let rotationDataElement = generateAppKVElementDataElement('Rotation: ', rotationVectorElement);

    let scaleUpdate = function(newScale) {
        component.object.scale = newScale;
        update(component);
    }
    let scaleVectorElement = generateVector3InputElements(object.scale, ["x", "y", "z"], scaleUpdate, 1);
    let scaleDataElement = generateAppKVElementDataElement('Scale: ', scaleVectorElement);

    let jumpToButtonContainer = generateJumpToButtonElement(object.position);

    sectionElement.appendChild(titleContainer);
    sectionElement.appendChild(visibilityDataElement);
    sectionElement.appendChild(geometryDataElement);
    sectionElement.appendChild(positionDataElement);
    sectionElement.appendChild(rotationDataElement);
    sectionElement.appendChild(scaleDataElement);
    sectionElement.appendChild(jumpToButtonContainer);
    return sectionElement;
}

/**
 * Calculates the luma value of a given color.
 * 
 * @param {string} color - The color in hexadecimal format (e.g., "#FFFFFF").
 * @returns {number} The luma value of the color.
 */
function luma(color) {
    color = color.substring(1);
    color = parseInt(color, 16);
    let r = (color >> 16) & 0xff;
    let g = (color >>  8) & 0xff;
    let b = (color >>  0) & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Generates an application title element with the given name, color, and update function.
 * 
 * @param {string} name - The name of the application.
 * @param {string} color - The color of the application.
 * @param {function} update - The function to be called when the color is updated.
 * @returns {HTMLElement} The generated application title element.
 */
function generateAppTitleElement(name, color, update) {
    let titleContainer = document.createElement('div');
    titleContainer.classList.add('title-container');

    let nameElement = document.createElement('h2');
    nameElement.classList.add('title');
    nameElement.innerText = name;

    let l = luma(color);
    console.log("luma", l);
    if (l < 60) {
        nameElement.classList.add('dark');
    }
    let colorUpdate = function(newColor) {
        update(newColor);
    }
    let colorDataElement = generateColorPickerElement(color, colorUpdate);

    titleContainer.appendChild(nameElement);
    titleContainer.appendChild(colorDataElement);
    return titleContainer;
}

/* Generate the application info elements for an object.
* Object data contains the object's position, rotation, scale
* and the color of the object. The elements are added to a
* container element that is returned.
*/
function generateObjectElements(app, objectData) {
    let container = document.createElement('div');
    container.classList.add('object-container');


    return container;

}

/**
 * Generates a color picker element.
 * 
 * @param {string} color - The default color value for the color picker.
 * @param {Function} update - The callback function to be called when the color value changes.
 * @returns {HTMLInputElement} The color picker element.
 */
function generateColorPickerElement(color, update) {
    let colorInput = document.createElement('input');
    colorInput.setAttribute('type', 'color');
    colorInput.defaultValue = color;
    colorInput.addEventListener('change', () => {
        update(colorInput.value);
    });
    return colorInput;
}

/**
 * Generates a visibility checkbox element.
 *
 * @param {boolean} visible - The initial visibility state of the checkbox.
 * @param {Function} update - The callback function to be called when the checkbox state changes.
 * @returns {HTMLElement} The generated checkbox element.
 */
function generateVisibilityCheckboxElement(visible, update) {
    let checkboxElement = document.createElement('input');
    checkboxElement.setAttribute('type', 'checkbox');
    if (visible == null) {
        visible = true;
    }
    checkboxElement.checked = visible;
    checkboxElement.addEventListener('change', () => {
        update(checkboxElement.checked);
    });
    let checkboxDataElement = generateAppKVElementDataElement('Visible: ', checkboxElement);
    return checkboxDataElement;
}

/**
 * Generates a dropdown element for selecting a geometry and attaches an event listener to update the selected geometry.
 * 
 * @param {string|null} geometry - The currently selected geometry.
 * @param {function} update - The function to be called when the selected geometry is updated.
 * @returns {HTMLElement} The generated dropdown element.
 */
function generateGeometryDropdownElement(geometry, update) {
    let geometryDropdown = document.createElement('select');
    geometryDropdown.addEventListener('change', () => {
        update(geometryDropdown.value);
    });

    // If the app doesn't have a geometry, set it to the first option.
    if (geometry == null) {
        geometry = geometryOptions[0];
    }
    for (let i = 0; i < geometryOptions.length; i++) {
        let option = document.createElement('option');
        option.value = geometryOptions[i];
        option.innerText = geometryOptions[i];
        if (geometry == geometryOptions[i]) {
            option.selected = true;
        }
        geometryDropdown.appendChild(option);
    }
    let geometryDataElement = generateAppKVElementDataElement('Geometry: ', geometryDropdown);
    return geometryDataElement;
}


/**
 * Generates a jump-to button element.
 * 
 * @param {Array<number>} position - The position to jump to.
 * @returns {HTMLElement} - The jump-to button container element.
 */
function generateJumpToButtonElement(position) {
    let jumpToButtonContainer = document.createElement('div');
    let jumpToButton = document.createElement('button');
    jumpToButton.addEventListener('click', () => {
        // TODO: This is a hacky way to jump to the application.
        // We could instead update the camera position and look at
        // the application via the architecture controller.
        let cameraPosition = [...position];
        cameraPosition[1] += 10;
        cameraPosition[2] += 10;
        scene.setCameraPosition(cameraPosition);
        scene.setCameraLookAt(position);
    });
    jumpToButton.innerText = 'Jump To';
    jumpToButtonContainer.appendChild(jumpToButton);
    return jumpToButtonContainer;
}

// General data element creation functions

/**
 * Generates an app key-value element data element.
 * 
 * @param {string} k - The key for the data element.
 * @param {HTMLElement} vElement - The value element to be appended to the data element.
 * @returns {HTMLElement} - The generated data element.
 */
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

/**
 * Generates a key-value data element for the application information sidebar.
 * 
 * @param {string} k - The key of the data element.
 * @param {string} v - The value of the data element.
 * @returns {HTMLElement} - The generated data element.
 */
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

/**
 * Generates a data element for the application key list.
 * 
 * @param {string} k - The key for the application list.
 * @param {Array<string>} list - The list of items for the application key.
 * @returns {HTMLElement} - The generated data element.
 */
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

/**
 * Generates a container with input elements for a 3D vector.
 * 
 * @param {number[]} vs - The initial values of the vector.
 * @param {string[]} labels - The labels for each input element.
 * @param {function} update - The callback function to be called when the value of an input element changes.
 * @param {number} [step=1] - The step value for the input elements.
 * @param {number|null} [min=null] - The minimum value for the input elements.
 * @param {number|null} [max=null] - The maximum value for the input elements.
 * @returns {HTMLElement} - The container element with the input elements.
 */
function generateVector3InputElements(vs, labels, update, step = 1, min = null, max = null) {
    let container = document.createElement('div');
    container.classList.add('vector-input-container');

    for (let i = 0; i < labels.length; i++) {
        let value = vs[i];
        let label = labels[i];
        let onChange = (newValue) => {
            newValue = parseFloat(newValue);
            update(newValue);
        }
        let input = generateNumberInput(value, label, onChange, step, min, max);
        container.appendChild(input);
    }
    return container;
}

/**
 * Generates a number input element with a label and optional min/max values.
 * 
 * @param {number} value - The initial value of the number input.
 * @param {string} label - The label text for the number input.
 * @param {function} onChange - The callback function to be called when the value of the number input changes.
 * @param {number} [step=1] - The step value for the number input.
 * @param {number|null} [min=null] - The minimum value allowed for the number input.
 * @param {number|null} [max=null] - The maximum value allowed for the number input.
 * @returns {HTMLElement} - The container element containing the label and number input.
 */
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
