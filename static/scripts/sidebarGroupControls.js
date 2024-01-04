import {
    generateAppTitleElement,
    generateAppKVElementDataElement,
    generateCheckboxElement,
    generateGeometryDropdownElement,
    generateVector3InputElements,
    generateJumpToButtonElement,
    generateNumberInput
} from './sidebarControls.js';

// Populate the application info section within the sidebar. This should
// provide buttons to jump the camera to the location of the application
// in the world.

var groupInfoSidebarElement;

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
        groupInfoSidebarElement = document.getElementById('group-info-list');

        filterInput = document.getElementById('group-filter-input');
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
    groupInfoSidebarElement.innerHTML = '';

    if (architectureData === undefined) {
        console.log('architecture data is undefined, cannot display group info');
        return;
    }
    if (architectureData.components === undefined) {
        console.log('architecture data components are undefined, cannot display group info');
        return;
    }
    if (architectureData.groups === undefined) {
        console.log('architecture data groups are undefined, cannot display group info');
        return;
    }

    for (let i = 0; i < architectureData.groups.length; i++) {
        let group = architectureData.groups[i];
        if (filterText != '' && !group.name.toLowerCase().includes(filterText.toLowerCase())) {
            continue;
        }

        let updateGroup = function (newGroup) {
            architectureData.groups[i] = newGroup;
            archController.setArchitectureState(architectureData);
        }
        let sectionElement = generateGroupElement(group, updateGroup);
        groupInfoSidebarElement.appendChild(sectionElement);
    }
}

/**
 * Generates a component element for the sidebar group info.
 * 
 * @param {Object} group - The group object.
 * @param {Function} update - The update function to be called when the component is updated.
 * @returns {HTMLElement} - The generated section element.
 */
function generateGroupElement(group, update) {
    let sectionElement = document.createElement('section');
    sectionElement.classList.add('info-box');
    sectionElement.style.setProperty('--box-color', group.boundingBox.color);
    let boundingBox = group.boundingBox;

    let titleUpdate = function(newColor) {
        group.boundingBox.color = newColor;
        update(group);
    }
    let titleContainer = generateAppTitleElement(group.name, boundingBox.color, titleUpdate);
    
    let visibleUpdate = function(newVisible) {
        group.boundingBox.visible = newVisible;
        update(group);
    }
    let visibilityDataElement = generateCheckboxElement("Visible:", boundingBox.visible, visibleUpdate);

    let paddingUpdate = function(newPadding) {
        group.boundingBox.padding = newPadding;
        update(group);
    }
    let paddingNumberInput = generateNumberInput(group.boundingBox.padding, "", paddingUpdate, 0.1);
    let paddingDataElement = generateAppKVElementDataElement("Padding:", paddingNumberInput);

    sectionElement.appendChild(titleContainer);
    sectionElement.appendChild(visibilityDataElement);
    sectionElement.appendChild(paddingDataElement);
    return sectionElement;
}

