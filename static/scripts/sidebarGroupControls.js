import {
    generateAppTitleElement,
    generateAppKVElementDataElement,
    generateCheckboxElement,
    generateNumberInput,
    generateEditableListElement
} from './sidebarControls.js';

// Populate the group info section within the sidebar.

var groupInfoSidebarElement;

// Filter variables
var filterInput;
var filterText = '';

/**
 * Initializes the group info sidebar.
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

        groupInfoSidebarElement = document.getElementById('group-info-list');
        if (groupInfoSidebarElement === null) {
            reject({error: 'group-info-list not found'});
            return;
        }
        filterInput = document.getElementById('group-filter-input');
        if (filterInput === null) {
            reject({error: 'group-filter-input not found'});
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
        let sectionElement = generateGroupElement(group, architectureData.components, updateGroup);
        groupInfoSidebarElement.appendChild(sectionElement);
    }
}

/**
 * Generates a component element for the sidebar group info.
 * 
 * @param {Object} group - The group object.
 * @param {list} components - The list of components in the architecture.
 * @param {Function} update - The update function to be called when the component is updated.
 * @returns {HTMLElement} - The generated section element.
 */
function generateGroupElement(group, components, update) {
    let sectionElement = document.createElement('section');
    sectionElement.classList.add('info-box');
    sectionElement.style.setProperty('--box-color', group.boundingBox.color);
    let boundingBox = group.boundingBox;

    let titleNameUpdate = function(newName) {
        group.name = newName;
        update(group);
    }
    let titleColorUpdate = function(newColor) {
        group.boundingBox.color = newColor;
        update(group);
    }
    let titleContainer = generateAppTitleElement(group.name, titleNameUpdate, boundingBox.color, titleColorUpdate);
    
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

    let serverListUpdate = function(newComponentData) {
        let componentIds = newComponentData.map((component) => component.value);
        group.components = componentIds;
        update(group);
    }

    let groupComponents = components.filter((component) => group.components.includes(component.id));
    let groupList = groupComponents.map((component) => {
        return {value: component.id, text: component.name};
    });
    let componentOptions = components.map((component) => {
        return {value: component.id, text: component.name};
    });
    let serverListElement = generateEditableListElement(groupList, serverListUpdate, componentOptions);
    let serverListDataElement = generateAppKVElementDataElement("Server List:", serverListElement);
    serverListDataElement.classList.add('column');

    sectionElement.appendChild(titleContainer);
    sectionElement.appendChild(visibilityDataElement);
    sectionElement.appendChild(paddingDataElement);
    sectionElement.appendChild(serverListDataElement);
    return sectionElement;
}

