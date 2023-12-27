import * as alert from './alert.js'
import * as sidebarApplicationInfo from './sidebarApplicationInfo.js'

import * as scene from './scene.js';
import { applicationData } from './applicationDataExample.js';

var saveLayoutButton;

var saveNameInput;
var saveDescriptionInput;
var saveFileButton;
var saveServerButton;

var dialog;
var dialogCloseButton;

// Initialize the application info sidebar. Returns a promise that resolves
// when the sidebar has been initialized.
export function init() {
    return new Promise((resolve, reject) => {
        // Save to server
        saveServerButton = document.getElementById('save-layout-server');
        saveServerButton.addEventListener('click', () =>
            saveToServer(applicationData)
        );

        // Save to file
        saveFileButton = document.getElementById('save-layout-file');
        saveFileButton.addEventListener('click', () =>
            saveToFile("layout.json", applicationData)
        );
        

        resolve();
    });
}

function saveToFile(filename, data) {
    let blob = new Blob([JSON.stringify(data)], {
        type: "text/json",
        name: filename
    });
    let saveLink = document.createElement('a');
    saveLink.href = window.URL.createObjectURL(blob);
    saveLink.download = "layout.json";
    document.body.appendChild(saveLink);
    saveLink.click();
    saveLink.remove();
}

function saveToServer(data) {
    fetch('/architectures/', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert.success("Layout saved to server.");
        } else {
            response.text().then(text => {
                alert.error("Failed to save layout to server. " + text);
            });
        }
    })
    .catch((error) => {
        alert.error("Failed to save layout to server.");
        console.error('Error:', error);
    });
}
