// Populate the application info section within the sidebar. This should
// provide buttons to jump the camera to the location of the application
// in the world.

import {resetScene, setCameraLookAt, setCameraPosition} from './index.js';

var applicationInfoSidebarElement;

export function init() {
    applicationInfoSidebarElement = document.getElementById('application-info-list');
}

export function displayApplicationData(applicationData) {
    applicationInfoSidebarElement.innerHTML = '';

    for (let i = 0; i < applicationData.applications.length; i++) {
        let app = applicationData.applications[i];

        let sectionElement = document.createElement('section');
        sectionElement.classList.add('application-info');

        let nameElement = document.createElement('h2');
        nameElement.classList.add('app-name');
        nameElement.innerText = app.name;
        
        let colorElement = document.createElement('span');
        colorElement.classList.add('color-display');
        let colorText = document.createElement('p');
        colorText.classList.add('app-color');
        colorText.innerText = app.color;
        let colorInput = document.createElement('input');
        colorInput.setAttribute('type', 'color');
        colorInput.defaultValue = app.color;
        colorInput.addEventListener('change', () => {
            app.color = colorInput.value;
            displayApplicationData(applicationData);
            resetScene();
        });
        colorElement.appendChild(colorText);
        colorElement.appendChild(colorInput);
        let colorDataElement = generateAppKVElementDataElement('Color: ', colorElement);

        let serverNames = app.servers.map((server) => server.name);
        let serverDataElement = generatAppKListDataElement('Servers: ', serverNames);

        let positionString = app.position.join(", ");
        let positionDataElement = generateAppKVDataElement('Position: ', positionString);

        let jumpToButtonContainer = document.createElement('div');
        let jumpToButton = document.createElement('button');
        jumpToButton.addEventListener('click', () => {
            let cameraPosition = [...app.position];
            cameraPosition[2] += 10;
            setCameraPosition(cameraPosition);
            setCameraLookAt(app.position);
        });
        jumpToButton.innerText = 'Jump To';
        jumpToButtonContainer.appendChild(jumpToButton);

        sectionElement.appendChild(nameElement);
        sectionElement.appendChild(colorDataElement);
        sectionElement.appendChild(serverDataElement);
        sectionElement.appendChild(positionDataElement);
        sectionElement.appendChild(jumpToButtonContainer);

        applicationInfoSidebarElement.appendChild(sectionElement);
    }
}

function generateAppKVElementDataElement(k, vElement) {
    let dataElement = document.createElement('div');
    dataElement.classList.add('app-data-kv');

    let titleElement = document.createElement('p');
    titleElement.classList.add('title');
    titleElement.innerText = k;

    dataElement.appendChild(titleElement);
    dataElement.appendChild(vElement);
    return dataElement;
}

function generateAppKVDataElement(k, v) {
    let dataElement = document.createElement('div');
    dataElement.classList.add('app-data-kv');

    let titleElement = document.createElement('p');
    titleElement.classList.add('title');
    titleElement.innerText = k;

    let vElement = document.createElement('p');
    vElement.innerText = v;

    dataElement.appendChild(titleElement);
    dataElement.appendChild(vElement);
    return dataElement;
}

function generatAppKListDataElement(k, list) {
    let dataElement = document.createElement('div');
    dataElement.classList.add('app-data-list');
    let appListTitleElement = document.createElement('p');
    appListTitleElement.classList.add('title');
    appListTitleElement.innerText = k
    let ulElement = document.createElement('ul');
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
