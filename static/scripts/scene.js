import * as THREE from 'three';

import gsap from 'gsap';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { PopupWindow } from './popupWindow.js';
import * as alert from './alert.js';


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

// Text geometry used for the application names.
var font;
var textObjects = [];
var textScale = 1;
var textRotate = false;

// Shaders
var vertexShader;
var fragmentShader;

// Load the external files for the scene. Returns a promise that resolves
// when all the files have been loaded.
export function load() {
    let fontPromise = new Promise((resolve, reject) => {
        let fontLoader = new FontLoader();
        fontLoader.load('static/css/fonts/Noto_Sans/NotoSans_Regular.json', function (f) {
            font = f;
        });
        resolve();
    });
    
    // Load the vertex and fragment shaders from external files.
    let vertexPromise = new Promise((resolve, reject) => {
        let vertexShaderLoader = new THREE.FileLoader(THREE.DefaultLoadingManager);
        vertexShaderLoader.load('static/shaders/vertex.vert', function (data) {
            console.log("vertex", data);
            vertexShader = data;
        });
        resolve();
    });

    let fragmentPromise = new Promise((resolve, reject) => {
        let fragmentShaderLoader = new THREE.FileLoader(THREE.DefaultLoadingManager);
        fragmentShaderLoader.load('static/shaders/fragment.frag', function (data) {
            console.log("fragment", data);
            fragmentShader = data;
        });
        resolve();
    });

    return new Promise((resolve, reject) => {
        Promise.allSettled([fontPromise, vertexPromise, fragmentPromise]).then(() => {
            resolve();
        });
    });
}

// Initialize the scene and all the objects within it. Returns a promise
// that resolves when the scene has been initialized.
export function init(archController) {
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
        scene.fog = new THREE.Fog(0x2a2b2b, 0, 200);

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
        controls.addEventListener('change', () => {
            if (textRotate) {
                rotateText();
            }
            render();
        });

        ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        renderer.domElement.style.touchAction = 'none';
        renderer.domElement.addEventListener('pointermove', onPointerMove);
        renderer.domElement.addEventListener('click', onClick);

        window.onresize = windowResize;

        archController.subscribe((applicationData) => {
            reset(applicationData);
        });

        resolve();
    });    
}

// Start the animation loop. This should be called after the scene has
// been initialized.
export function start() {
    animate();
}

// Reset the scene based on the new application data.
export function reset(applicationData) {
    clearObjects();
    createSceneFromData(applicationData);
    createApplicationsFromData(applicationData);
}

// Reset only the application meshes in the scene. This will
// not reset the scene level data. This is used when we do not
// want to reset the camera position or the fog.
export function resetApplications(applicationData) {
    clearObjects();
    createApplicationsFromData(applicationData);
}

// Set scene based on application data.
export function createSceneFromData(applicationData) {
    let sceneData = applicationData.scene;
    let cameraData = sceneData.camera;
    let fogData = sceneData.fog;
    let textData = sceneData.text;
    setCameraPosition(cameraData.position);
    setFog(fogData.near, fogData.far);
    setTextScale(textData.scale);
    setTextRotate(textData.rotate);
}

// Remove all the application meshes from the scene.
export function clearObjects() {
    sceneObjects.forEach(function(object) {
        scene.remove(object);
    });
    sceneObjects = [];
    selectableObjects = [];
    textObjects = [];

    hoveredObjects = [];
    selectedObjects = [];
    hoverOutlinedObjects = [];
    selectedOutlinedObjects = [];
}

// Create the applications based on the application data.
export function createApplicationsFromData(applicationData) {
    let pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 100, 0);
    scene.add(pointLight);
    sceneObjects.push(pointLight);

    // Create the application from the application data.
    for (let i=0; i < applicationData.components.length; i++) {
        let component = applicationData.components[i];
        let visible = component.object.visible;
        if (visible != null && !visible) {
            continue;
        }

        let color = component.object.color;
        let position = component.object.position;
        let rotation = component.object.rotation;
        let scale = component.object.scale;
        let posX = position[0];
        let posY = position[1];
        let posZ = position[2];
        let rotX = rotation[0];
        let rotY = rotation[1];
        let rotZ = rotation[2];
        let scaleX = scale[0];
        let scaleY = scale[1];
        let scaleZ = scale[2];
        let geometry = component.object.geometry;

        // Convert the rotation from degrees to radians.
        rotX = rotX * Math.PI / 180;
        rotY = rotY * Math.PI / 180;
        rotZ = rotZ * Math.PI / 180;

        let geometryMesh;

        // Set the geometry based on the geometry type in the application data.
        switch (geometry) {
            case "box":
                geometryMesh = new THREE.BoxGeometry(1, 1, 1);
                break;
            case "capsule":
                geometryMesh = new THREE.CapsuleGeometry(1, 1, 16, 16);
                break;
            case "circle":
                geometryMesh = new THREE.CircleGeometry(1, 32);
                break;
            case "cone":
                geometryMesh = new THREE.ConeGeometry(1, 2, 32);
                break;
            case "cylinder":
                geometryMesh = new THREE.CylinderGeometry(1, 1, 2.5, 32);
                break;
            case "dodecahedron":
                geometryMesh = new THREE.DodecahedronGeometry(1, 0);
                break;
            case "icosahedron":
                geometryMesh = new THREE.IcosahedronGeometry(1, 0);
                break;
            case "octahedron":
                geometryMesh = new THREE.OctahedronGeometry(1, 0);
                break;
            case "plane":
                geometryMesh = new THREE.PlaneGeometry(1, 1);
                break;
            case "ring":
                geometryMesh = new THREE.RingGeometry(0.5, 1, 32);
                break;
            case "sphere":
                geometryMesh = new THREE.SphereGeometry(1, 32, 16);
                break;
            case "tetrahedron":
                geometryMesh = new THREE.TetrahedronGeometry(1, 0);
                break;
            case "torus":
                geometryMesh = new THREE.TorusGeometry(1, 0.4, 16, 100);
                break;
            case "torusKnot":
                geometryMesh = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
                break;
            default:
                geometryMesh = new THREE.BoxGeometry(1, 1, 1);
                break;
        }

        let material = new THREE.MeshStandardMaterial({
            color: color,
        });
        let mesh = new THREE.Mesh(geometryMesh, material);
        mesh.position.set(posX, posY, posZ);
        mesh.rotateX(rotX);
        mesh.rotateY(rotY);
        mesh.rotateZ(rotZ);
        mesh.scale.set(scaleX, scaleY, scaleZ);
        mesh.userData = component;

        scene.add(mesh);
        selectableObjects.push(mesh);
        sceneObjects.push(mesh);

        let textGeo = new TextGeometry(component.name, {
            font: font,
            size: 1,
            height: 0.2,
            curveSegments: 2,
        });
        textGeo.computeBoundingBox();
        textGeo.translate(
            -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x),
            0,
            -0.5 * (textGeo.boundingBox.max.z - textGeo.boundingBox.min.z)
        );

        let textMaterial = new THREE.MeshStandardMaterial({color: color});
        let textMesh = new THREE.Mesh(textGeo, textMaterial);
        let highestY = getHighestYPoint(mesh);
        textMesh.position.set(posX, highestY + 1, posZ);
        textMesh.scale.set(textScale, textScale, textScale);

        // Create a look at vector that is the same as the camera
        // position but with the y value of the text object.
        if (textRotate) {
            let cameraPosition = camera.position.clone();
            cameraPosition.y = textMesh.position.y;
            textMesh.lookAt(cameraPosition);
        }

        scene.add(textMesh);
        sceneObjects.push(textMesh);
        textObjects.push(textMesh);
    }

    // Add the connections between the applications.
    for (let i=0; i < applicationData.connections.length; i++) {
        let connection = applicationData.connections[i];
        let source = connection.source;
        let target = connection.target;
        let sourceApplication = findApplicationDataByName(source, applicationData);
        let targetApplication = findApplicationDataByName(target, applicationData);
        let sourceMesh = findObjectByName(source, selectableObjects);
        let targetMesh = findObjectByName(target, selectableObjects);
        if (sourceMesh == null || targetMesh == null) {
            alert.error("Could not find source or target for connection: " + source + " -> " + target);
            continue;
        }

        let sourceCenter = getMeshCenter(sourceMesh);
        let targetCenter = getMeshCenter(targetMesh);
        let sourceLowest = getLowestYPoint(sourceMesh);
        let targetLowest = getLowestYPoint(targetMesh);
        sourceCenter.y = sourceLowest;
        targetCenter.y = targetLowest;

        let sourceColor = sourceApplication.object.color;
        let targetColor = targetApplication.object.color;
        let midpoint = getMidpoint(sourceCenter, targetCenter);
        midpoint.addVectors(new THREE.Vector3(0, -5, 0), midpoint);

        let curve = new THREE.QuadraticBezierCurve3(sourceCenter, midpoint, targetCenter);
        let points = curve.getPoints(50);
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        // let material = new THREE.LineBasicMaterial({
        //     color: color,

        //     // Unlikely to take effect.
        //     // https://threejs.org/docs/?q=LineBasicMaterial#api/en/materials/LineBasicMaterial.linewidth
        //     linewidth: 10
        // });

        let colorPercentStart = 0.05;
        let material = new THREE.ShaderMaterial( {
            uniforms: THREE.UniformsUtils.merge( [
                THREE.UniformsLib[ 'fog' ],
                {
                    time: { value: 1.0 },
                    sourcePosition: { value: sourceCenter },
                    targetPosition: { value: targetCenter },
                    sourceColor: { value: new THREE.Color(sourceColor) },
                    targetColor: { value: new THREE.Color(targetColor) },
                    colorPercent: { value: colorPercentStart }
                }
            ] ),
            // lights: true,
            fog: true,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        } );

        // Set interval to update the time uniform.
        let colorPercentIncrement = 0.001;
        let colorPercentFluctuation = colorPercentStart / 3;
        let colorPercentMin = colorPercentStart - colorPercentFluctuation;
        let colorPercentMax = colorPercentStart + colorPercentFluctuation;
        console.log("colorPercentStart: " + colorPercentStart);
        console.log("colorPercentFluctuation: " + colorPercentFluctuation);
        console.log("colorPercentMin: " + colorPercentMin);
        console.log("colorPercentMax: " + colorPercentMax);
        setInterval(() => {
            material.uniforms.time.value += 0.005;

            // // Pulse the size of the color change up and down.
            // let colorPercent = material.uniforms.colorPercent.value;
            // colorPercent += colorPercentIncrement;
            // if (colorPercent > colorPercentMax) {
            //     colorPercentIncrement = -colorPercentIncrement;
            // } else if (colorPercent < colorPercentMin) {
            //     colorPercentIncrement = -colorPercentIncrement;
            // }

            // material.uniforms.colorPercent.value = colorPercent;
        }, 10);

        let line = new THREE.Line(geometry, material);
        scene.add(line);
        sceneObjects.push(line);

        // Add the arrow head just before the target.
        let arrowHead = new THREE.ArrowHelper(curve.getTangent(1), targetCenter, 0, sourceColor, 0.4, 0.2);
        scene.add(arrowHead);
        sceneObjects.push(arrowHead);
    }
}

// Vertex helper functions.

// Get the center of a mesh in world space.
function getMeshCenter(mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = new THREE.Vector3();
    box.getCenter(center);
    console.log("BBox Center:", center);
    return center;
}

// Find the middle point between two points in 3D space.
function getMidpoint(point1, point2) {
    let v = new THREE.Vector3();
    v.addVectors(point1, point2);
    v.divideScalar(2);
    return v;
}

// Lowest y point in the mesh geometry.
function getLowestYPoint(mesh) {
    let box = new THREE.Box3().setFromObject(mesh);
    return box.min.y;
}

// Highest y point in the mesh geometry.
function getHighestYPoint(mesh) {
    let box = new THREE.Box3().setFromObject(mesh);
    return box.max.y;
}

// Event handlers

// Handle mouse movement. This is used to detect when the mouse is hovering
// over an object.
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

// Handle mouse clicks. This is used to detect when the mouse is clicked
// on an object. When an object is clicked, a popup is created with the
// application information stored on the object's userData.
function onClick(event) {
    selectedObjects = [...hoveredObjects];

    // Create a popup with the application information stored on the 
    // object's userData.
    if (selectedObjects.length > 0) {
        let component = selectedObjects[0].userData;
        console.log(component);
        let object = component.object;
        let content = document.createElement("article");
        content.classList.add("info-box");
        content.classList.add("start-dark");
        content.classList.add("no-border");
        content.innerHTML = `
            <section class="info-box-kv"><p class="key">Color:</p><p class="value" style="color: ${object.color}">${object.color}</p></section>
            <section class="info-box-kv"><p class="key">Position:</p><p class="value">${object.position}</p></section>
            <section class="info-box-kv"><p class="key">Rotation:</p><p class="value">${object.rotation}</p></section>
            <section class="info-box-kv"><p class="key">Scale:</p><p class="value">${object.scale}</p></section>
        `;
        let popup = new PopupWindow(document.body, component.name, content);
        let popupElement = popup.getWindowElement();
        let popupWidth = popupElement.offsetWidth;
        console.log(popupWidth);

        // Show the popup based on the mouse position.
        let popupX = event.clientX - xPos - (popupWidth / 2);
        let popupY = event.clientY - yPos - 20;
        console.log(popupX, popupY);
        popup.setPosition(popupX, popupY);
        popup.show();
    }

}

// Handle window resizing. This is used to update the camera and renderer
// when the window is resized.
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

// Scene rendering.

// Render the scene. This is going to be called every frame via requestAnimationFrame.
// This is the main loop for the rendering.
function animate() {
    requestAnimationFrame( animate );
    render();
}

// Render the scene. We are using a composer to render the scene with
// the outline pass. Carefully organise the objects to be outlined so that
// we do not have the same object outlined twice.
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

// Helper functions for finding objects and application data.

// Find the object with the given name.
export function findObjectByName(name, selectableObjects) {
    for (let i = 0; i < selectableObjects.length; i++) {
        let object = selectableObjects[i];
        if (object.userData.name === name) {
            return object;
        }
    }
    return null;
}

// Find application data with the given name.
export function findApplicationDataByName(name, applicationData) {
    for (let i = 0; i < applicationData.components.length; i++) {
        let application = applicationData.components[i];
        if (application.name === name) {
            return application;
        }
    }
    return null;
}

// Scene manipulation functions.

// Set the camera position. position is an array of 3 numbers.
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
        onUpdate: () => {
            controls.update();
        }
    });
}

// Get the camera position.
export function getCameraPosition() {
    return [camera.position.x, camera.position.y, camera.position.z];
}

// Set the camera look at position. position is an array of 3 numbers.
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

// Set the fog planes in the scene.
export function setFog(near, far) {
    scene.fog.near = near;
    scene.fog.far = far;

}

// Get the fog planes in the scene.
export function getFogNear() {
    return scene.fog.near;
}
export function getFogFar() {
    return scene.fog.far;
}

// Set the text scale in the scene. Text us scaled uniformly in all
// directions.
export function setTextScale(scale) {
    textScale = scale;
    
}
export function getTextScale() {
    return textScale;
}

// Set the text rotation in the scene. This determines
// whether the text should be rotated to face the camera.
export function setTextRotate(rotation) {
    textRotate = rotation;

    // Reset the text rotation if the text is not to be rotated.
    if (!textRotate) {
        for (let i = 0; i < textObjects.length; i++) {
            let object = textObjects[i];
            object.rotation.set(0, 0, 0);
        }
        return;
    }

    rotateText();
}
export function getTextRotate() {
    return textRotate;
}

// Rotate the text to face the camera.
function rotateText() {
    for (let i = 0; i < textObjects.length; i++) {
        let textObject = textObjects[i];
        
        // Create a look at vector that is the same as the camera
        // position but with the y value of the text object.
        let cameraPosition = camera.position.clone();
        cameraPosition.y = textObject.position.y;
        textObject.lookAt(cameraPosition);
    }
}
