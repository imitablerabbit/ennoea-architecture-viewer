import * as alert from './alert.js'
import * as rh from '../deps/regex-highlighter/src/highlight.js' 

var saveLayoutButton;
var loadLayoutButton;

var dialog;
var dialogCloseButton;
var dialogSubmitFileButton;
var dialogSubmitTextButton;
var jsonFileInput;
var jsonTextBox;

var highlighter;
var jsonSyntaxRules;

// Default application data that will be used to generate the scene.
export var applicationData = {
    applications: [
        {
            name: "app1",
            color: "#0287fc",
            servers: [
                {
                    name: "app1hostname2"
                },
                {
                    name: "app1hostname2"
                }
            ],
            position: [0, 0, 0]
        },
        {
            name: "app2",
            color: "#06f7fc",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [10, 0, 0]
        }
    ]
}

export function init() {
    saveLayoutButton = document.getElementById('save-layout');
    loadLayoutButton = document.getElementById('load-layout');

    dialog = document.getElementById("load-dialog");
    dialogCloseButton = document.getElementById("load-layout-close");
    dialogSubmitFileButton = document.getElementById("load-layout-submit-file");
    dialogSubmitTextButton = document.getElementById("load-layout-submit-text");
    jsonFileInput = document.getElementById("load-layout-file-input");
    jsonTextBox = document.getElementById("load-layout-text-box");

    highlighter = new rh.RegexHighlighter();
    highlighter.loadSyntaxHighlightingByClass("syntax-highlight", );
    highlighter.ajaxGET("/static/deps/regex-highlighter/src/languages/json.json", function (response) {
        jsonSyntaxRules = JSON.parse(response);
    });

    saveLayoutButton.addEventListener('click', () => save("layout.json", applicationData));

    loadLayoutButton.addEventListener('click', () => {
        jsonTextBox.innerText = JSON.stringify(applicationData, null, 4);
        syntaxHighlight(highlighter, jsonSyntaxRules, jsonTextBox);
        dialog.showModal();
    });

    jsonTextBox.addEventListener('input', () => {
        syntaxHighlight(highlighter, jsonSyntaxRules, jsonTextBox);
    });
    dialogCloseButton.addEventListener('click', () => {
        dialog.close();
    });
    dialogSubmitFileButton.addEventListener('click', async function() {
        if (jsonFileInput.files.length == 0) {
            alert.error("File missing from application data load.");
            return;
        }
        let file = jsonFileInput.files[0];
        let newAppData = await Promise.resolve(file.text());
        applicationData = JSON.parse(newAppData);
        console.log(applicationData);
        alert.success("New application data loaded from file" + file.name +".");
        dialog.close();
    });
    dialogSubmitTextButton.addEventListener('click', () => {
        let newAppData = jsonTextBox.innerText;
        applicationData = JSON.parse(newAppData);
        console.log(applicationData);
        alert.success("New application data loaded from text.")
        dialog.close();
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

function syntaxHighlight(highlighter, syntaxRules, element) {
    var result = highlighter.insertSyntaxHighlighting(syntaxRules, element.innerHTML);
    if (result) {
        // This is breaking the position of the cursor as it gets moved to the
        // top of the data. We should find a way of insering the elements directly
        // in the dom instead.
        // element.innerHTML = result;
    }
}