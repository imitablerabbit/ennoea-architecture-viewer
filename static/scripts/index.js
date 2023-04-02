import * as scene from './scene.js'
import * as sidebar from './sidebar.js'
import * as collapsable from './collapsable.js'
import * as alert from './alert.js'
import * as layoutLoading from './layoutLoading.js';
import * as sidebarSceneControls from './sidebarSceneControls.js';
import * as sidebarApplicationInfo from './sidebarApplicationInfo.js';
import { applicationData } from './applicationDataExample.js';
import * as debug from './debug.js';


// Load the scene and all of the modules after the page has loaded.
window.addEventListener('load', load);

function load() {
    scene.load().then(() => {init();});
}

function init() {
    // Initialize all modules. We need to wait for all of them to finish
    // before we can start the application.
    let alertPromise = alert.init();
    let scenePromise = scene.init();
    let sidebarPromise = sidebar.init();
    let collapsablePromise = collapsable.init();
    let sidebarSceneControlsPromise = sidebarSceneControls.init();
    let sidebarApplicationInfoPromise = sidebarApplicationInfo.init();
    let layoutLoadingPromise = layoutLoading.init();
    let debugPromise = debug.init();
    let promises = [
        alertPromise, scenePromise, sidebarPromise,
        collapsablePromise, sidebarSceneControlsPromise,
        sidebarApplicationInfoPromise,
        layoutLoadingPromise, debugPromise
    ];
    Promise.allSettled(promises).then(() => {
        start();
    });
}

function start() {
    scene.reset(applicationData);
    scene.start();
    sidebarSceneControls.start(applicationData);
    sidebarApplicationInfo.start(applicationData);
}
