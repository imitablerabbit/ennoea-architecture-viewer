import * as THREE from 'three';

import gsap from 'gsap';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';


// Canvas dimensions and positions
var width, height;
var xPos, yPos;
var container;

// three.js scene and higher level controls.
var renderer, scene, camera;
var composer, renderPass;
var controls;
var cameraLookAtPosition = new THREE.Vector3(0, 0, 0);
var sceneObjects = [];

// General Scene elements.
var ambientLight;

// Font used for the application names.
var font;

// Object selections and outline postprocessing shaders. Hover pass will
// always take precedent over the selected pass. We must have strict
// accounting for the selected objects otherwise the outline pass
// post-processor doesnt like it. If this ends up being expensive then we
// can always remove some of the functionality of the current OutlinePass
// shader with a slimlined version of it.
var outlinePassHover, outlinePassSelected;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var selectableObjects = [];
var hoveredObjects = [];
var selectedObjects = [];
var hoverOutlinedObjects = [];
var selectedOutlinedObjects = [];

const loader = new FontLoader();

// Load the external files for the scene. Returns a promise that resolves
// when all the files have been loaded.
export function load() {
    return new Promise((resolve, reject) => {
        loader.load('static/css/fonts/Noto_Sans/NotoSans_Regular.json', function (f) {
            font = f;
            resolve();
        } );
    });
}

// Initialize the scene and all the objects within it. Returns a promise
// that resolves when the scene has been initialized.
export function init() {
    return new Promise((resolve, reject) => {
        container = document.getElementById('container');
        width = window.innerWidth;
        height = window.innerHeight;
        xPos = window.innerWidth - width;
        yPos = window.innerHeight - height;

        console.log("Width: " + width + " Height: " + height);

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.autoClear = false;
        container.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x2a2b2b);
        scene.fog = new THREE.Fog(0x2a2b2b, 5, 200);

        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 10;

        composer = new EffectComposer(renderer);

        renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);
        
        outlinePassHover = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
        outlinePassHover.edgeStrength = 10;
        outlinePassHover.selectedObjects = hoverOutlinedObjects;
        composer.addPass(outlinePassHover);

        outlinePassSelected = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
        outlinePassSelected.edgeStrength = 10;
        outlinePassSelected.selectedObjects = selectedOutlinedObjects;
        outlinePassSelected.visibleEdgeColor = new THREE.Color(1, 0, 0);
        composer.addPass(outlinePassSelected);

        controls = new OrbitControls(camera, renderer.domElement, scene);
        controls.addEventListener('change', render);

        ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        renderer.domElement.style.touchAction = 'none';
        renderer.domElement.addEventListener('pointermove', onPointerMove);
        renderer.domElement.addEventListener('click', onClick);

        window.onresize = windowResize;

        resolve();
    });    
}

// Start the animation loop. This should be called after the scene has
// been initialized.
export function start() {
    animate();
}

// Destroy the scene and reinitialize it. This also includes all of the scene
// level data in the application data.
export function reset(applicationData) {
    updateObjects(applicationData);
    setCameraPosition(applicationData.scene.camera.position);
}

// Regenerate the scene based on the new application data.
export function updateObjects(applicationData) {
    sceneObjects.forEach(function(object) {
        scene.remove(object);
    });
    selectableObjects = [];
    hoveredObjects = [];
    selectedObjects = [];
    hoverOutlinedObjects = [];
    selectedOutlinedObjects = [];
    sceneObjects = [];
    generateApplicationMeshes(applicationData);
}

function generateApplicationMeshes(applicationData) {
    let pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 100, 0);
    scene.add(pointLight);
    sceneObjects.push(pointLight);

    for (let i=0; i < applicationData.applications.length; i++) {
        let application = applicationData.applications[i];

        let name = application.name;
        let color = application.color;
        let position = application.position;
        let rotation = application.rotation;
        let scale = application.scale;
        let servers = application.servers;
        let posX = position[0];
        let posY = position[1];
        let posZ = position[2];
        let rotX = rotation[0];
        let rotY = rotation[1];
        let rotZ = rotation[2];
        let scaleX = scale[0];
        let scaleY = scale[1];
        let scaleZ = scale[2];

        // Convert the rotation from degrees to radians.
        rotX = rotX * Math.PI / 180;
        rotY = rotY * Math.PI / 180;
        rotZ = rotZ * Math.PI / 180;

        // let geometry = new THREE.SphereGeometry(1, 32, 16);
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let material = new THREE.MeshStandardMaterial({
            color: color,
        });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(posX, posY, posZ);
        mesh.rotateX(rotX);
        mesh.rotateY(rotY);
        mesh.rotateZ(rotZ);
        mesh.scale.set(scaleX, scaleY, scaleZ);

        scene.add(mesh);
        selectableObjects.push(mesh);
        sceneObjects.push(mesh);



        let textGeo = new TextGeometry(name, {
            font: font,
            size: 1,
            height: 0.2,
            curveSegments: 2,
        } );
        let textMaterial = new THREE.MeshStandardMaterial({color: color});
        let textMesh = new THREE.Mesh(textGeo, textMaterial);
        let xOffset = (name.length) / 2 / 1.5; // todo: base this off the size of the geometry
        textMesh.position.set(posX - xOffset, posY + 2, posZ);
        scene.add(textMesh);
        sceneObjects.push(textMesh);

        console.log(mesh.position);
    }
}

function onPointerMove(event) {
    if (event.isPrimary === false) return;
    let canvasX = event.clientX - xPos;
    let canvasY = event.clientY - yPos;
    mouse.x = (canvasX / width) * 2 - 1;
    mouse.y = - (canvasY / height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(selectableObjects);

    hoveredObjects = [];
    for (let i = 0; i < intersects.length; i++) {
        let object = intersects[i].object;
        hoveredObjects[i] = object;
    }
}

function onClick(event) {
    selectedObjects = [...hoveredObjects];
}

function windowResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    xPos = window.innerWidth - width;
    yPos = window.innerHeight - height;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
    controls.update();
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    hoverOutlinedObjects = [...hoveredObjects];
    selectedOutlinedObjects = [];
    for (let i = 0; i < selectedObjects.length; i++) {
        let object = selectedObjects[i];
        if (!hoverOutlinedObjects.includes(object)) {
            selectedOutlinedObjects.push(object);
        }
    }
    outlinePassHover.selectedObjects = hoverOutlinedObjects;
    outlinePassSelected.selectedObjects = selectedOutlinedObjects;

    composer.render();
}

export function setCameraPosition(position) {
    if (position === null) {
        console.error("position is null: ", position);
        return;
    }
    if (Object.prototype.toString.call(position) != '[object Array]') {
        console.error("position is not an Array: ", position);
        return;
    }
    if (position.length != 3) {
        console.error("position is not a 3 element Array: ", position);
        return;
    }

    gsap.to(camera.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 1,
        onUpdate: () => controls.update()
    });
}

export function setCameraLookAt(position) {
    if (position === null) {
        console.error("position is null: ", position);
        return;
    }
    if (Object.prototype.toString.call(position) != '[object Array]') {
        console.error("position is not an Array: ", position);
        return;
    }
    if (position.length != 3) {
        console.error("position is not a 3 element Array: ", position);
        return;
    }

    gsap.to(cameraLookAtPosition, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 1,
        onUpdate: () => controls.update()
    });
    controls.target = cameraLookAtPosition;
}
