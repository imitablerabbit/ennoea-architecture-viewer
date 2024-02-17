import {
    generateAppKVElementDataElement,
    generateAppTitleElement,
    generateDropdownElement,
    generateNumberInput
} from './sidebarControls.js';

// Populate the connection info section within the sidebar.

var connectionsInfoSidebarElement;

// Filter variables
var filterInput;
var filterText = '';

// Connection flow options
var flowOptions = ['out', 'in', 'bi'];

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

        connectionsInfoSidebarElement = document.getElementById('connection-info-list');
        if (connectionsInfoSidebarElement === null) {
            reject({error: 'connection-info-list not found'});
            return;
        }
        filterInput = document.getElementById('connection-filter-input');
        if (filterInput === null) {
            reject({error: 'connections-filter-input not found'});
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
            console.log('sidebarConnectionControls subscribe update');
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
    connectionsInfoSidebarElement.innerHTML = '';

    if (architectureData === undefined) {
        console.log('architecture data is undefined, cannot display connections info');
        return;
    }
    if (architectureData.components === undefined) {
        console.log('architecture data components are undefined, cannot display connections info');
        return;
    }
    if (architectureData.connections === undefined) {
        console.log('architecture data connectionss are undefined, cannot display connections info');
        return;
    }

    console.log(architectureData.connections);
    let componentList = architectureData.components.map((component) => component.name);
    for (let i = 0; i < architectureData.connections.length; i++) {
        console.log(architectureData.connections[i]);
        let connection = architectureData.connections[i];
        let source = connection.source;
        let target = connection.target;
        if (filterText != '' &&
            !source.toLowerCase().includes(filterText.toLowerCase()) &&
            !target.toLowerCase().includes(filterText.toLowerCase())){

            console.log('filtering out connection');
            continue;
        }

        let updateConnection = function (newConnection) {
            architectureData.connections[i] = newConnection;
            archController.setArchitectureState(architectureData);
        }
        let sectionElement = generateConnectionElement(connection, componentList, updateConnection);
        connectionsInfoSidebarElement.appendChild(sectionElement);
    }
}

/**
 * Generates a component element for the sidebar connection info.
 * 
 * @param {Object} connection - The connection object.
 * @param {Function} update - The update function to be called when the component is updated.
 * @returns {HTMLElement} - The generated section element.
 */
function generateConnectionElement(connection, connectionsList, update) {
    let sectionElement = document.createElement('section');
    sectionElement.classList.add('info-box');

    let titleNameUpdate = function(newName) {
        connection.name = newName;
        update(connection);
    };
    let titleContainer = generateAppTitleElement(connection.name, titleNameUpdate);

    let sourceUpdate = function(newSource) {
        connection.source = newSource;
        update(connection);
    };
    let sourceDropdown = generateDropdownElement(connectionsList, connection.source, sourceUpdate);
    let sourceElement = generateAppKVElementDataElement('Source', sourceDropdown);

    let targetUpdate = function(newTarget) {
        connection.target = newTarget;
        update(connection);
    };
    let targetDropdown = generateDropdownElement(connectionsList, connection.target, targetUpdate);
    let targetElement = generateAppKVElementDataElement('Target', targetDropdown);

    let flowUpdate = function(newFlow) {
        connection.flow = newFlow;
        update(connection);
    };
    let flowDropdown = generateDropdownElement(flowOptions, connection.flow, flowUpdate);
    let flowElement = generateAppKVElementDataElement('Flow', flowDropdown);

    let inRateUpdate = function(newInRate) {
        connection.inRate = newInRate;
        update(connection);
    };
    let inRateInput = generateNumberInput(connection.inRate, "", inRateUpdate, 10, 0);
    let inRateElement = generateAppKVElementDataElement('In Rate', inRateInput);
    inRateElement.setAttribute('title', 'Value is ignored if the "flow" is set to "out"');

    let outRateUpdate = function(newOutRate) {
        connection.outRate = newOutRate;
        update(connection);
    }
    let outRateInput = generateNumberInput(connection.outRate, "", outRateUpdate, 10, 0);
    let outRateElement = generateAppKVElementDataElement('Out Rate', outRateInput);
    outRateElement.setAttribute('title', 'Value is ignored if the "flow" is set to "in"');

    sectionElement.appendChild(titleContainer);
    sectionElement.appendChild(sourceElement);
    sectionElement.appendChild(targetElement);
    sectionElement.appendChild(flowElement);
    sectionElement.appendChild(inRateElement);
    sectionElement.appendChild(outRateElement);

    return sectionElement;
}

