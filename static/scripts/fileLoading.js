import * as alert from './alert.js'

import {json} from "@codemirror/lang-json"
import { basicSetup, EditorView } from 'codemirror'
import { oneDark } from '@codemirror/theme-one-dark';

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
export function init(archController) {
    return new Promise((resolve, reject) => {
        // Dialog related elements
        dialog = document.getElementById("load-dialog");
        loadLayoutButton = document.getElementById('load-layout');
        loadLayoutButton.addEventListener('click', () => {
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

            let applicationData = archController.getArchitectureState();
            let jsonText = JSON.stringify(applicationData, null, 4);
            jsonTextBox.innerHTML = ""; // Clear any editors from previous loading.
            editorView = new EditorView({
                doc: jsonText,
                parent: jsonTextBox,
                extensions: [basicSetup, json(), oneDark]
            })

            dialog.showModal();
        });
        dialogCloseButton = document.getElementById("load-layout-close");
        dialogCloseButton.addEventListener('click', () => {
            dialog.close();
        });

        // Load from Server
        dialogSubmitServerButton = document.getElementById("load-layout-submit-server");
        serverSelect = document.getElementById("load-layout-server-select");
        dialogSubmitServerButton.addEventListener('click', () => {
            let architectureId = serverSelect.value;
            let name = serverSelect.options[serverSelect.selectedIndex].text;
            fetch('/architectures/' + architectureId)
                .then(response => response.json())
                .then(data => {
                    let applicationData = data;
                    reloadData(archController, applicationData);
                    alert.success("New application data loaded from server. Loaded architecture: " + data.name + ".");
                    dialog.close();
                })
                .catch(error => {
                    alert.error("Failed to load architecture data from server. Failed loading architecture: " + name + ".");
                    console.error(error);
                });
        });
        
        // Load from File
        dialogSubmitFileButton = document.getElementById("load-layout-submit-file");
        jsonFileInput = document.getElementById("load-layout-file-input");
        dialogSubmitFileButton.addEventListener('click', async function() {
            if (jsonFileInput.files.length == 0) {
                alert.error("File missing from application data load.");
                return;
            }
            let file = jsonFileInput.files[0];
            let newAppData = await Promise.resolve(file.text());
            let applicationData = JSON.parse(newAppData);
            reloadData(archController, applicationData);
            alert.success("New application data loaded from file" + file.name +".");
            dialog.close();
        });

        // Load from Text
        dialogSubmitTextButton = document.getElementById("load-layout-submit-text");
        jsonTextBox = document.getElementById("load-layout-text-box");
        dialogSubmitTextButton.addEventListener('click', () => {
            let newAppData = editorView.state.doc.toString();
            let applicationData = JSON.parse(newAppData);
            reloadData(archController, applicationData);
            alert.success("New application data loaded from text.")
            dialog.close();
        });

        resolve();
    });
}

function reloadData(archController, newAppData) {
    archController.setArchitectureState(newAppData);
    console.log("reloadData:", newAppData);
}
