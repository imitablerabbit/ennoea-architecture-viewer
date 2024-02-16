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
        if (archController === undefined) {
            reject({error: 'archController is undefined'});
            return;
        }

        // Dialog related elements
        dialog = document.getElementById("create-dialog");
        if (dialog === null) {
            reject({error: 'create-dialog not found'});
            return;
        }
        dialogCloseButton = document.getElementById("create-layout-close");
        if (dialogCloseButton === null) {
            reject({error: 'create-layout-close not found'});
            return;
        }
        createLayoutButton = document.getElementById('create-layout');
        if (createLayoutButton === null) {
            reject({error: 'create-layout not found'});
            return;
        }
        createNameInput = document.getElementById("create-layout-name");
        if (createNameInput === null) {
            reject({error: 'create-layout-name not found'});
            return;
        }
        createDescriptionInput = document.getElementById("create-layout-description");
        if (createDescriptionInput === null) {
            reject({error: 'create-layout-description not found'});
            return;
        }
        createSubmitButton = document.getElementById("create-layout-submit");
        if (createSubmitButton === null) {
            reject({error: 'create-layout-submit not found'});
            return;
        }

        createLayoutButton.addEventListener('click', () => {
            dialog.showModal();
        });
        dialogCloseButton.addEventListener('click', () => {
            dialog.close();
        });

        // create form related elements
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
