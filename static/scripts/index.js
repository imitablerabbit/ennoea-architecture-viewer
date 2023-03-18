import * as THREE from 'three';
import './sidebar.js'
import * as alert from './alert.js'
import * as sidebar from './sidebar.js'
import * as sidebarApplicationInfo from './sidebarApplicationInfo.js';
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

// General Scene elements.
var ambientLight;

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

// Default application data that will be used to generate the scene.
var applicationData = {
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




const loader = new FontLoader();
loader.load( 'static/css/fonts/Noto_Sans/NotoSans_Regular.json', function ( font ) {
    init(font);
    animate();
} );

function init(font) {
    container = document.getElementById('container');
    width = container.clientWidth;
    height = container.clientHeight;
    xPos = window.innerWidth - width;
    yPos = window.innerHeight - height;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.autoClear = false;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2b2b);
    scene.fog = new THREE.Fog(0x2a2b2b, 5, 50);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.position.z = 10;

    generateApplicationMeshes(applicationData, scene, font);

    composer = new EffectComposer(renderer);

    renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    outlinePassHover = new OutlinePass(new THREE.Vector2(container.clientWidth,container.clientHeight), scene, camera);
    outlinePassHover.edgeStrength = 10;
    outlinePassHover.selectedObjects = hoverOutlinedObjects;
    composer.addPass(outlinePassHover);

    outlinePassSelected = new OutlinePass(new THREE.Vector2(container.clientWidth,container.clientHeight), scene, camera);
    outlinePassSelected.edgeStrength = 10;
    outlinePassSelected.selectedObjects = selectedOutlinedObjects;
    outlinePassSelected.visibleEdgeColor = new THREE.Color(1, 0, 0);
    composer.addPass(outlinePassSelected);

    controls = new OrbitControls(camera, renderer.domElement, scene);
    controls.addEventListener('change', render);

    ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    window.onresize = windowResize;

    alert.init();
    sidebar.init();
    sidebarApplicationInfo.init();
    sidebarApplicationInfo.displayApplicationData(applicationData);
}

function generateApplicationMeshes(applicationData, scene, font) {
    for (let i=0; i < applicationData.applications.length; i++) {
        let application = applicationData.applications[i];

        let name = application.name;
        let color = application.color;
        let position = application.position;
        let servers = application.servers;
        let x = position[0];
        let y = position[1];
        let z = position[2];

        let geometry = new THREE.SphereGeometry(1, 32, 16);
        let material = new THREE.MeshStandardMaterial({
            color: color,
        });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        selectableObjects.push(mesh);

        let pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(x, y + 20, z);
        scene.add(pointLight);

        let textGeo = new TextGeometry(name, {
            font: font,
            size: 1,
            height: 0.2,
            curveSegments: 2,
        } );
        let textMaterial = new THREE.MeshBasicMaterial({color: color});
        let textMesh = new THREE.Mesh(textGeo, textMaterial);
        let xOffset = (name.length) / 2 / 1.5; // todo: base this off the size of the geometry
        textMesh.position.set(x - xOffset, y + 2, z);
        scene.add(textMesh);

        console.log(mesh.position);
    }
}

function onPointerMove(event) {
    if (event.isPrimary === false) return;
    let canvasX = event.clientX - xPos;
    let canvasY = event.clientY - yPos;
    mouse.x = (canvasX / container.clientWidth) * 2 - 1;
    mouse.y = - (canvasY / container.clientHeight) * 2 + 1;

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
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
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