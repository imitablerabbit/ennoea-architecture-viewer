import * as alert from './alert.js'

var createLayoutButton;

var dialog;
var dialogCloseButton;

var createNameInput;
var createDescriptionInput;
var createSubmitButton;

// Initialize the application info sidebar. Returns a promise that resolves
// when the sidebar has been initialized.
export function init(archController) {
    return new Promise((resolve, reject) => {

        // Dialog related elements
        dialog = document.getElementById("create-dialog");
        createLayoutButton = document.getElementById('create-layout');
        createLayoutButton.addEventListener('click', () => {
            dialog.showModal();
        });
        dialogCloseButton = document.getElementById("create-layout-close");
        dialogCloseButton.addEventListener('click', () => {
            dialog.close();
        });

        // create form related elements
        createNameInput = document.getElementById("create-layout-name");
        createDescriptionInput = document.getElementById("create-layout-description");
        createSubmitButton = document.getElementById("create-layout-submit");
        createSubmitButton.addEventListener('click', () => {
            let name = createNameInput.value;
            let description = createDescriptionInput.value;
            let info = {
                name: name,
                description: description
            };
            let scene = {
                camera: {
                    position: [0, 20, 20]
                },
                fog: {
                    near: 0,
                    far: 100
                },
                text: {
                    scale: 1,
                    rotate: true
                }
            }
            let components = [];
            let connections = [];
            let newAppData = {
                info: info,
                scene: scene,
                components: components,
                connections: connections
            };
            reloadData(archController, newAppData);
            dialog.close();
        });

        resolve();
    });
}

function reloadData(archController, newAppData) {
    archController.setArchitectureState(newAppData);
}
