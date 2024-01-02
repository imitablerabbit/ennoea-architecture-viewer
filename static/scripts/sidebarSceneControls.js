// Populate the application info section within the sidebar. This should
// provide buttons to jump the camera to the location of the application
// in the world.

import * as scene from './scene.js';

var sceneCameraXInput;
var sceneCameraYInput;
var sceneCameraZInput;

var sceneCameraSaveButton;

var fogNearInput;
var fogFarInput;

var appNamesScaleInput;
var appNamesRotateCheckbox;

// Initialize the application info sidebar. Returns a promise that resolves
// when the sidebar has been initialized.
export function init(archController) {
    return new Promise((resolve, reject) => {
        sceneCameraXInput = document.getElementById('scene-camera-x');
        sceneCameraYInput = document.getElementById('scene-camera-y');
        sceneCameraZInput = document.getElementById('scene-camera-z');

        sceneCameraSaveButton = document.getElementById('scene-camera-save');

        fogNearInput = document.getElementById('scene-fog-near');
        fogFarInput = document.getElementById('scene-fog-far');

        appNamesScaleInput = document.getElementById('scene-text-scale');
        appNamesRotateCheckbox = document.getElementById('scene-text-rotate');

        // Subscribe to the archController for notifications
        archController.subscribe((applicationData) => {
            displayApplicationData(applicationData);
        });

        resolve();
    });
}

// Render the application info sidebar.
export function displayApplicationData(applicationData) {
    // Set up the camera position controls.
    let cameraPosition = applicationData.scene.camera.position;
    updateCameraPositionInput(cameraPosition);
    sceneCameraXInput.addEventListener('change', (event) => {
        cameraPosition[0] = event.target.value;
        scene.setCameraPosition(cameraPosition);
    });
    sceneCameraYInput.addEventListener('change', (event) => {
        cameraPosition[1] = event.target.value;
        scene.setCameraPosition(cameraPosition);
    });
    sceneCameraZInput.addEventListener('change', (event) => {
        cameraPosition[2] = event.target.value;
        scene.setCameraPosition(cameraPosition);
    });
    sceneCameraSaveButton.addEventListener('click', (event) => {
        let cameraPosition = scene.getCameraPosition();
        applicationData.scene.camera.position = cameraPosition;
        updateCameraPositionInput(cameraPosition);
    });

    // Set up the fog controls.
    let fog = applicationData.scene.fog;
    fogNearInput.value = fog.near;
    fogFarInput.value = fog.far;
    fogNearInput.addEventListener('change', (event) => {
        fog.near = parseFloat(event.target.value);
        scene.setFog(fog.near, fog.far);
    });
    fogFarInput.addEventListener('change', (event) => {
        fog.far = parseFloat(event.target.value);
        scene.setFog(fog.near, fog.far);
    });

    // Set up the text controls.
    let text = applicationData.scene.text;
    appNamesScaleInput.value = text.scale;
    appNamesRotateCheckbox.checked = text.rotate;
    appNamesScaleInput.addEventListener('change', (event) => {
        text.scale = parseFloat(event.target.value);
        scene.setTextScale(text.scale);
        scene.resetApplications(applicationData);
    });
    appNamesRotateCheckbox.addEventListener('change', (event) => {
        text.rotate = event.target.checked;
        scene.setTextRotate(text.rotate);
        scene.resetApplications(applicationData);
    });
}

// Update the camera position in the sidebar.
export function updateCameraPositionInput(cameraPosition) {
    sceneCameraXInput.value = cameraPosition[0];
    sceneCameraYInput.value = cameraPosition[1];
    sceneCameraZInput.value = cameraPosition[2];
}
