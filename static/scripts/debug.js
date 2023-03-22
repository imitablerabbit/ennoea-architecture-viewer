// Implements the debug console.

import * as alert from './alert.js';

var debugDialog = document.getElementById('debug');

export function init() {
    document.addEventListener('keydown', function (event) {
        if (event.key == '~') {
            debugDialog.showModal();
        }
    });

    let closeButton = document.getElementById('debug-dialog-close');
    closeButton.addEventListener('click', () => debugDialog.close());

    initAlertButtons();
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
