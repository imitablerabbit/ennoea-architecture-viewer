// Implements the debug console.

import * as alert from './alert.js';

var debugDialog;
var closeButton;

// Initialise the debug console. Returns a promise that resolves when the
// debug console has been initialised.
export function init() {
    return new Promise((resolve, reject) => {
        debugDialog = document.getElementById('debug');
        document.addEventListener('keydown', function (event) {
            if (event.key == '~') {
                debugDialog.showModal();
            }
        });

        closeButton = document.getElementById('debug-dialog-close');
        closeButton.addEventListener('click', () => debugDialog.close());

        initAlertButtons();

        resolve();
    });
}

// Initialise the alert buttons in the debug console. Each button should open up
// a different type of alert.
function initAlertButtons() {
    let alertButton = document.getElementById('debug-trigger-normal-alert');
    let successButton = document.getElementById('debug-trigger-success-alert');
    let errorButton = document.getElementById('debug-trigger-error-alert');

    alertButton.addEventListener('click', () => alert.alert("This is a normal alert."));
    successButton.addEventListener('click', () => alert.success("This is a success alert."));
    errorButton.addEventListener('click', () => alert.error("This is an error alert."));
}
