import {
    generateAppTitleElement,
    generateAppKVElementDataElement,
    generateCheckboxElement,
    generateGeometryDropdownElement,
    generateVector3InputElements,
    generateJumpToButtonElement
} from './sidebarControls.js';

// Populate the application info section within the sidebar. This should
// provide buttons to jump the camera to the location of the application
// in the world.

var applicationInfoSidebarElement;

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

    let titleUpdate = function(newColor) {
        component.object.color = newColor;
        update(component);
    }
    let titleContainer = generateAppTitleElement(component.name, object.color, titleUpdate);
    
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

