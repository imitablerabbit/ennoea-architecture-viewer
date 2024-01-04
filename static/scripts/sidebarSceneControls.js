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
        sceneCameraXInput.addEventListener('change', (event) => {
            let applicationData = archController.getArchitectureState();
            let cameraPosition = applicationData.scene.camera.position;
            cameraPosition[0] = event.target.value;
            scene.setCameraPosition(cameraPosition); // Just moving the camera in scene, not updating state
        });
        sceneCameraYInput.addEventListener('change', (event) => {
            let applicationData = archController.getArchitectureState();
            let cameraPosition = applicationData.scene.camera.position;
            cameraPosition[1] = event.target.value;
            scene.setCameraPosition(cameraPosition); // Just moving the camera in scene, not updating state
        });
        sceneCameraZInput.addEventListener('change', (event) => {
            let applicationData = archController.getArchitectureState();
            let cameraPosition = applicationData.scene.camera.position;
            cameraPosition[2] = event.target.value;
            scene.setCameraPosition(cameraPosition); // Just moving the camera in scene, not updating state
        });
        sceneCameraSaveButton = document.getElementById('scene-camera-save');
        sceneCameraSaveButton.addEventListener('click', (event) => {
            let applicationData = archController.getArchitectureState();
            let cameraPosition = scene.getCameraPosition();
            applicationData.scene.camera.position = cameraPosition;
            archController.setArchitectureState(applicationData);
        });

        fogNearInput = document.getElementById('scene-fog-near');
        fogFarInput = document.getElementById('scene-fog-far');
        fogNearInput.addEventListener('change', (event) => {
            let applicationData = archController.getArchitectureState();
            applicationData.scene.fog.near = parseFloat(event.target.value);
            archController.setArchitectureState(applicationData);
        });
        fogFarInput.addEventListener('change', (event) => {
            let applicationData = archController.getArchitectureState();
            applicationData.scene.fog.far = parseFloat(event.target.value);
            archController.setArchitectureState(applicationData);
        });

        appNamesScaleInput = document.getElementById('scene-text-scale');
        appNamesRotateCheckbox = document.getElementById('scene-text-rotate');
        appNamesScaleInput.addEventListener('change', (event) => {
            let applicationData = archController.getArchitectureState();
            applicationData.scene.text.scale = parseFloat(event.target.value);
            archController.setArchitectureState(applicationData);
        });
        appNamesRotateCheckbox.addEventListener('change', (event) => {
            let applicationData = archController.getArchitectureState();
            applicationData.scene.text.rotate = event.target.checked;
            archController.setArchitectureState(applicationData);
        });

        // Subscribe to the archController for notifications
        archController.subscribe((applicationData) => {
            updateSceneControls(applicationData);
        });

        resolve();
    });
}

// Render the application info sidebar.
export function updateSceneControls(applicationData) {
    // Set up the camera position controls.
    let cameraPosition = applicationData.scene.camera.position;
    sceneCameraXInput.value = cameraPosition[0];
    sceneCameraYInput.value = cameraPosition[1];
    sceneCameraZInput.value = cameraPosition[2];

    // Set up the fog controls.
    let fog = applicationData.scene.fog;
    fogNearInput.value = fog.near;
    fogFarInput.value = fog.far;

    // Set up the text controls.
    let text = applicationData.scene.text;
    appNamesScaleInput.value = text.scale;
    appNamesRotateCheckbox.checked = text.rotate;
}
