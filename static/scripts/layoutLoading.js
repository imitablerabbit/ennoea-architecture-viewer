import * as alert from './alert.js'
import * as sidebarApplicationInfo from './sidebarApplicationInfo.js'

import {json} from "@codemirror/lang-json"
import { basicSetup, EditorView } from 'codemirror'
import { oneDark } from '@codemirror/theme-one-dark';
import * as scene from './scene.js';
import { applicationData } from './applicationDataExample.js';

var saveLayoutButton;
var loadLayoutButton;

var dialog;
var dialogCloseButton;
var dialogSubmitServerButton;
var dialogSubmitFileButton;
var dialogSubmitTextButton;
var serverSelect;
var jsonFileInput;
var jsonTextBox;

// CodeMirror variables
var editorView;


// Initialize the application info sidebar. Returns a promise that resolves
// when the sidebar has been initialized.
export function init() {
    return new Promise((resolve, reject) => {
        saveLayoutButton = document.getElementById('save-layout');
        loadLayoutButton = document.getElementById('load-layout');

        dialog = document.getElementById("load-dialog");
        dialogCloseButton = document.getElementById("load-layout-close");

        dialogSubmitServerButton = document.getElementById("load-layout-submit-server");
        serverSelect = document.getElementById("load-layout-server-select");
        
        dialogSubmitFileButton = document.getElementById("load-layout-submit-file");
        jsonFileInput = document.getElementById("load-layout-file-input");

        dialogSubmitTextButton = document.getElementById("load-layout-submit-text");
        jsonTextBox = document.getElementById("load-layout-text-box");

        saveLayoutButton.addEventListener('click', () => save("layout.json", applicationData));

        loadLayoutButton.addEventListener('click', () => {
            let jsonText = JSON.stringify(applicationData, null, 4);
            jsonTextBox.innerHTML = ""; // Clear any editors from previous loading.

            // Load the architecture data from the server and add it
            // to the select element.
            serverSelect.innerHTML = "";
            fetch('/architectures/')
                .then(response => response.json())
                .then(data => {
                    for (let i = 0; i < data.length; i++) {
                        let option = document.createElement('option');
                        option.value = data[i].id;
                        option.innerHTML = data[i].name;
                        serverSelect.appendChild(option);
                    }
                })
                .catch(error => {
                    alert.error("Failed to load architecture data from server.");
                    console.error(error);
                });

            editorView = new EditorView({
                doc: jsonText,
                parent: jsonTextBox,
                extensions: [basicSetup, json(), oneDark]
            })
            dialog.showModal();
        });

        dialogCloseButton.addEventListener('click', () => {
            dialog.close();
        });
        dialogSubmitServerButton.addEventListener('click', () => {
            let architectureId = serverSelect.value;
            fetch('/architectures/' + architectureId)
                .then(response => response.json())
                .then(data => {
                    applicationData = data;
                    reloadData(applicationData);
                    console.log(applicationData);
                    alert.success("New application data loaded from server.");
                    dialog.close();
                })
                .catch(error => {
                    alert.error("Failed to load architecture data from server.");
                    console.error(error);
                });
        });
        dialogSubmitFileButton.addEventListener('click', async function() {
            if (jsonFileInput.files.length == 0) {
                alert.error("File missing from application data load.");
                return;
            }
            let file = jsonFileInput.files[0];
            let newAppData = await Promise.resolve(file.text());
            applicationData = JSON.parse(newAppData);
            reloadData(applicationData);
            console.log(applicationData);
            alert.success("New application data loaded from file" + file.name +".");
            dialog.close();
        });
        dialogSubmitTextButton.addEventListener('click', () => {
            let newAppData = editorView.state.doc.toString();
            applicationData = JSON.parse(newAppData);
            reloadData(applicationData);
            console.log(applicationData);
            alert.success("New application data loaded from text.")
            dialog.close();
        });

        resolve();
    });
}

function save(filename, data) {
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

function reloadData(newAppData) {
    sidebarApplicationInfo.displayApplicationData(newAppData);
    scene.reset(newAppData);
}
