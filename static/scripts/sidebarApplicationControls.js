import {
    generateAppTitleElement,
    generateAppKVElementDataElement,
    generateCheckboxElement,
    generateVector3InputElements,
    generateDropdownElement,
} from './sidebarControls.js';

// Populate the application info section within the sidebar. This should
// provide buttons to jump the camera to the location of the application
// in the world.

var applicationInfoSidebarElement;

// Filter variables
var filterInput;
var filterText = '';

// Geometry options for the dropdown element.
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

/**
 * Initializes the application info sidebar.
 * 
 * @param {Object} archController - The architecture controller object.
 * @returns {Promise} A promise that resolves when the initialization is complete.
 */
export function init(archController) {
    return new Promise((resolve, reject) => {
        if (archController === undefined) {
            reject({error: 'archController is undefined'});
            return;
        }

        applicationInfoSidebarElement = document.getElementById('application-info-list');
        if (applicationInfoSidebarElement === null) {
            reject({error: 'application-info-list not found'});
            return;
        }
        filterInput = document.getElementById('application-filter-input');
        if (filterInput === null) {
            reject({error: 'application-filter-input not found'});
            return;
        }

        // Subscribe to the filter input for changes.
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

    if (architectureData === undefined) {
        console.log('architecture data is undefined, cannot display application info');
        return;
    }
    if (architectureData.components === undefined) {
        console.log('architecture data components are undefined, cannot display application info');
        return;
    }

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

    let titleNameUpdate = function(newName) {
        component.name = newName;
        update(component);
    }
    let titleColorUpdate = function(newColor) {
        component.object.color = newColor;
        update(component);
    }
    let titleContainer = generateAppTitleElement(component.name, titleNameUpdate, object.color, titleColorUpdate);
    
    let visibleUpdate = function(newVisible) {
        component.object.visible = newVisible;
        update(component);
    }
    let visibilityDataElement = generateCheckboxElement("Visible:", object.visible, visibleUpdate);

    let geometryUpdate = function(newGeometry) {
        component.object.geometry = newGeometry;
        update(component);
    }
    let geometryDataElement = generateGeometryDropdownElement(object.geometry, geometryUpdate);

    let positionUpdate = function(i, newPosition) {
        component.object.position[i] = newPosition;
        update(component);
    }
    let positionVectorElement = generateVector3InputElements(object.position, ["x", "y", "z"], positionUpdate, 1);
    let positionDataElement = generateAppKVElementDataElement('Position: ', positionVectorElement);

    let rotationUpdate = function(i, newRotation) {
        component.object.rotation[i] = newRotation;
        update(component);
    }
    let rotationVectorElement = generateVector3InputElements(object.rotation, ["x", "y", "z"], rotationUpdate, 1);
    let rotationDataElement = generateAppKVElementDataElement('Rotation: ', rotationVectorElement);

    let scaleUpdate = function(i, newScale) {
        component.object.scale[i] = newScale;
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
 * Generates a dropdown element for selecting a geometry and attaches an event listener to update the selected geometry.
 * 
 * @param {string|null} geometry - The currently selected geometry.
 * @param {function} update - The function to be called when the selected geometry is updated.
 * @returns {HTMLElement} The generated dropdown element.
 */
function generateGeometryDropdownElement(geometry, update) {
    let geometryDropdown = generateDropdownElement(geometryOptions, geometry, update);
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
    jumpToButton.classList.add('small');
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
