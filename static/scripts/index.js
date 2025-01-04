import * as alert from './alert.js'
import * as scene from './scene.js'
import * as sidebar from './sidebar.js'
import * as collapsable from './collapsable.js'
import * as fileCreate from './fileCreate.js'
import * as fileSaving from './fileSaving.js';
import * as fileLoading from './fileLoading.js';
import * as sidebarFileInfo from './sidebarFileInfo.js';
import * as sidebarSceneControls from './sidebarSceneControls.js';
import * as sidebarApplicationControls from './sidebarApplicationControls.js';
import * as sidebarGroupControls from './sidebarGroupControls.js';
import * as sidebarConnectionControls from './sidebarConnectionControls.js';
import * as debug from './debug.js';
import {ArchitectureController} from './architectureController.js'


// Load the scene and all of the modules after the page has loaded.
window.addEventListener('load', load);

function load() {
    scene.load().then(() => {init();});
}

function init() {
    // Initialize all modules. We need to wait for all of them to finish
    // before we can start the application.
    let alertPromise = alert.init();
    let debugPromise = debug.init();
    let collapsablePromise = collapsable.init();
    let sidebarPromise = sidebar.init();

    let archController = new ArchitectureController();

    let scenePromise = scene.init(archController);
    let sidebarFileInfoPromise = sidebarFileInfo.init(archController);
    let sidebarSceneControlsPromise = sidebarSceneControls.init(archController);
    let sidebarApplicationInfoPromise = sidebarApplicationControls.init(archController);
    let sidebarGroupInfoPromise = sidebarGroupControls.init(archController);
    let sidebarConnectionInfoPromise = sidebarConnectionControls.init(archController);

    let createPromise = fileCreate.init(archController);
    let savingPromise = fileSaving.init(archController);
    let loadingPromise = fileLoading.init(archController);

    let promises = [
        alertPromise, scenePromise, sidebarPromise, collapsablePromise,
        sidebarFileInfoPromise, sidebarSceneControlsPromise,
        sidebarApplicationInfoPromise, sidebarGroupInfoPromise,
        sidebarConnectionInfoPromise,
        createPromise, savingPromise, loadingPromise, debugPromise
    ];
    Promise.allSettled(promises).then((results) => {
        let errorResults = results.filter((result) => result.status === 'rejected');
        errorResults.forEach((errorResult) => {
            console.error('Error initializing module:', errorResult.reason);
        });
        start();
    });
}

function start() {
    scene.start();
}
