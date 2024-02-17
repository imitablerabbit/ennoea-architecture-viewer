import * as THREE from 'three';

import gsap from 'gsap';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { PopupWindow } from './popupWindow.js';
import * as alert from './alert.js';

import * as eventStack from './eventStack.js';

// Canvas dimensions and positions
var width, height;
var xPos, yPos;
var container;

// three.js scene and higher level controls.
var renderer, scene
var composer, renderPass;
var sceneObjects = [];

// Camera position and controls.
var camera;
var orbitControls;
var cameraLookAtPosition = new THREE.Vector3(0, 0, 0);

// Transform controls.
var transformControls;
var transformEscHandler, transformMouseHandler;
var transformObjectName = null;

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

// Controllers
var architectureController;
var previousApplicationData;

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
            console.info("vertex shader loaded:", data);
            vertexShader = data;
        });
        resolve();
    });

    let fragmentPromise = new Promise((resolve, reject) => {
        let fragmentShaderLoader = new THREE.FileLoader(THREE.DefaultLoadingManager);
        fragmentShaderLoader.load('static/shaders/fragment.frag', function (data) {
            console.info("fragment shader loaded:", data);
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

        architectureController = archController;

        console.info("init: Container Sizes: Width: " + width + " Height: " + height);

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

        orbitControls = new OrbitControls(camera, renderer.domElement, scene);
        transformControls = new TransformControls(camera, renderer.domElement);
        let controlsChange = () => {
            if (textRotate) {
                rotateText();
            }
            render();
        };
        orbitControls.addEventListener('change', controlsChange);
        transformControls.addEventListener('change', controlsChange);
        transformControls.addEventListener('dragging-changed', (event) => {
            // Disable orbit controls when transform controls are being used.
            // Obit controls will immediately become usable again when the
            // user stops dragging the object around.
            orbitControls.enabled = ! event.value;
        });
        scene.add(transformControls); // Add the transform controls to the scene.

        ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        renderer.domElement.style.touchAction = 'none';
        renderer.domElement.addEventListener('pointermove', onPointerMove);
        renderer.domElement.addEventListener('click', onClick);

        window.onresize = windowResize;

        archController.subscribe((applicationData) => {
            reset(previousApplicationData, applicationData);
            previousApplicationData = applicationData;
        });

        resolve();
    });
}

// Start the animation loop. This should be called after the scene has
// been initialized.
export function start() {
    animate();
}

/**
 * Resets the scene and applications based on the previous and current application data.
 * 
 * @param {object} previousApplicationData - The previous application data.
 * @param {object} applicationData - The current application data.
 */
export function reset(previousApplicationData, applicationData) {
    console.info("reset: previousApplicationData: ", previousApplicationData);
    console.info("reset: applicationData: ", applicationData);
    resetScene(previousApplicationData, applicationData);
    resetApplications(previousApplicationData, applicationData);
}

/**
 * Resets the scene based on the provided application data.
 * 
 * @param {object} previousApplicationData - The previous application data.
 * @param {object} applicationData - The current application data.
 * @returns {void}
 */
export function resetScene(previousApplicationData, applicationData) {
    if (applicationData === undefined) {
        console.error("reset: applicationData is undefined, skipping scene reset");
        return;
    }
    if (applicationData.scene === undefined) {
        console.error("reset: applicationData.scene is undefined, skipping scene reset");
        return;
    }
    if (previousApplicationData != undefined) {
        let prevJSON = JSON.stringify(previousApplicationData.scene);
        let currJSON = JSON.stringify(applicationData.scene);
        if (prevJSON == currJSON) {
            console.info("reset: applicationData.scene is the same as previousApplicationData.scene, skipping scene reset");
            return;
        }
    }
    createSceneFromData(applicationData);
}

/**
 * Resets the applications in the scene based on the provided application data.
 * If the application data does not contain any components, the application reset is skipped.
 * If the application data is the same as the previous application data, the application reset is skipped.
 * Otherwise, the scene is cleared and new applications are created based on the application data.
 * 
 * @param {object} previousApplicationData - The previous application data.
 * @param {object} applicationData - The new application data.
 */
export function resetApplications(previousApplicationData, applicationData) {
    if (applicationData.components === undefined) {
        // This should be an empty list of components.
        console.error("resetApplications: applicationData.components is undefined, skipping application reset");
        return;
    }
    if (previousApplicationData != undefined) {
        // Check if the scene.text is the same as previousApplicationData.scene.text.
        // This is something that is rendered when rendering the applications.
        let prevJSONText = JSON.stringify(previousApplicationData.scene.text);
        let currJSONText = JSON.stringify(applicationData.scene.text);

        // Check if the components, connections, and groups are the same.
        let prevJSONComp = JSON.stringify(previousApplicationData.components);
        let currJSONComp = JSON.stringify(applicationData.components);

        let prevJSONConn = JSON.stringify(previousApplicationData.connections);
        let currJSONConn = JSON.stringify(applicationData.connections);

        let prevJSONGroup = JSON.stringify(previousApplicationData.groups);
        let currJSONGroup = JSON.stringify(applicationData.groups);

        if (prevJSONText == currJSONText &&
            prevJSONComp == currJSONComp &&
            prevJSONConn == currJSONConn &&
            prevJSONGroup == currJSONGroup) {
            console.info("resetApplications: scene.text, applicationData.components, applicationData.connections, and applicationData.groups are the same as previousApplicationData, skipping application reset");
            return;
        }
    }
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

    if (applicationData === undefined) {
        console.error("createApplicationsFromData: applicationData is undefined, skipping scene applications");
        return;
    }

    renderApplicationsFromData(applicationData);
    renderGroupsFromData(applicationData);
    renderConnectionsFromData(applicationData);
}

/**
 * Renders applications from the provided application data.
 * 
 * @param {Object} applicationData - The data containing information about the applications.
 */
export function renderApplicationsFromData(applicationData) {
    if (applicationData === undefined) {
        console.error("renderApplicationsFromData: applicationData is undefined, skipping scene applications");
        return;
    }
    if (applicationData.components === undefined) {
        console.error("renderApplicationsFromData: applicationData.components is undefined, skipping scene applications");
        return;
    }
    for (let i=0; i < applicationData.components.length; i++) {
        let component = applicationData.components[i];
        let visible = component.object.visible;
        if (visible != null && !visible) {
            console.info("renderApplicationsFromData: Skipping invisible application: " + component.name);
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

            // It seems that we cannot use the transparent property with the
            // bounding box geometry. This is because the bounding box geometry
            // will also be transparent and there will be culling of objects
            // that are behind the bounding box.

            // transparent: true,
            // opacity: 0.5,
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

        // Attach the object to the transform controls if the object
        // was previously being transformed.
        if (transformObjectName != null && transformObjectName == component.name) {
            setTransformControls(architectureController, mesh, transformControls.getMode());
        }
    }
}

/**
 * Renders the groups from the application data.
 * 
 * @param {Object} applicationData - The application data containing groups.
 * @param {Object} applicationData.groups - The groups to render.
 */
export function renderGroupsFromData(applicationData) {
    if (applicationData === undefined) {
        console.error("renderGroupsFromData: applicationData is undefined, skipping scene groups");
        return;
    }
    if (applicationData.groups === undefined) {
        console.error("renderGroupsFromData: applicationData.groups is undefined, skipping scene groups");
        return;
    }
    for (let i=0; i < applicationData.groups.length; i++) {
        let group = applicationData.groups[i];
        let name = group.name;
        let components = group.components;
        let boundingBox = group.boundingBox;
        let padding = boundingBox.padding;
        let color = boundingBox.color;
        let visible = boundingBox.visible;
        if (visible != null && !visible) {
            console.info("renderGroupsFromData: Skipping invisible group: " + name);
            continue;
        }

        let groupMesh = new THREE.Group();
        groupMesh.name = name;
        groupMesh.userData = group;

        let anyVisiable = false;
        for (let j=0; j < components.length; j++) {
            let component = components[j];
            let componentMesh = findObjectByName(component, selectableObjects);
            if (componentMesh == null) {
                console.error("renderGroupsFromData: Could not find component: " + component);
                alert.error("Error rendering group " + name + ": could not find component: " + component);
                continue;
            }
            anyVisiable = true;
            groupMesh.add(componentMesh);
        }

        if (!anyVisiable) {
            console.info("renderGroupsFromData: Skipping group " + name + " because it does not contain any visible components");
            continue;
        }

        scene.add(groupMesh);
        sceneObjects.push(groupMesh);

        // Create a bounding box for the group.
        let box = new THREE.Box3().setFromObject(groupMesh);
        let boxCenter = new THREE.Vector3();
        box.getCenter(boxCenter);
        let boxSize = new THREE.Vector3();
        box.getSize(boxSize);

        // Adjust the box size with padding by adding the padding
        // to each side of the box. We do not want to multiply the
        // size of the box as it could be rectangular and we want
        // to keep the aspect ratio.
        boxSize.x += padding;
        boxSize.y += padding;
        boxSize.z += padding;

        // Create a bounding box wireframe for the group.
        let boxGeometry = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
        let edges = new THREE.EdgesGeometry(boxGeometry);
        let boxMesh = new THREE.LineSegments(edges);
        boxMesh.material.color.set(color);
        boxMesh.position.set(boxCenter.x, boxCenter.y, boxCenter.z);
        boxMesh.userData = group;
        scene.add(boxMesh);
        sceneObjects.push(boxMesh);
    }
}

/**
 * Renders connections from application data.
 * 
 * @param {Object} applicationData - The application data containing connections.
 */
export function renderConnectionsFromData(applicationData) {
    if (applicationData === undefined) {
        console.error("renderConnectionsFromData: applicationData is undefined, skipping scene connections");
        return;
    }
    if (applicationData.connections === undefined) {
        console.error("renderConnectionsFromData: applicationData.connections is undefined, skipping scene connections");
        return;
    }
    for (let i=0; i < applicationData.connections.length; i++) {
        let connection = applicationData.connections[i];
        let source = connection.source;
        let target = connection.target;

        let sourceApplication = findApplicationDataByName(source, applicationData);
        let targetApplication = findApplicationDataByName(target, applicationData);
        let sourceMesh = findObjectByName(source, selectableObjects);
        if (sourceMesh == null) {
            console.error("renderConnectionsFromData: Could not find source for connection: " + source + " -> " + target);
            alert.error("Could not find source for connection: " + source + " -> " + target);
            continue;
        }
        let targetMesh = findObjectByName(target, selectableObjects);
        if (targetMesh == null) {
            console.error("renderConnectionsFromData: Could not find target for connection: " + source + " -> " + target);
            alert.error("Could not find target for connection: " + source + " -> " + target);
            continue;
        }
        let objects = [sourceMesh, targetMesh];

        let sourceCenter = getMeshCenter(sourceMesh);
        let targetCenter = getMeshCenter(targetMesh);

        // Set the arrow start and end points to the center of the
        // source and target meshes to start with.
        let arrowStart = sourceCenter;
        let arrowEnd = targetCenter;

        // Raytrace from the source center in the direction of the
        // target center to find the intersection point. This is where
        // the arrow will end.
        let raycaster = new THREE.Raycaster();
        let direction = new THREE.Vector3();
        direction.subVectors(targetCenter, sourceCenter);
        direction.normalize();
        raycaster.set(sourceCenter, direction);
        let intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            arrowEnd = intersects[0].point;
        }

        // Raytrace from the target center in the direction of the
        // source center to find the intersection point. This is where
        // the arrow will start.
        direction.subVectors(sourceCenter, targetCenter);
        raycaster.set(targetCenter, direction);
        intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            arrowStart = intersects[0].point;
        }

        let midpoint = getMidpoint(sourceCenter, targetCenter);

        // Add gravity to the midpoint if the source and target are
        // not on the same y plane. We want a slight curve in the
        // arrow. We also want to make sure that the arrow is not
        // pointing up or down.
        let sourceLowestY = getLowestYPoint(sourceMesh);
        let targetLowestY = getLowestYPoint(targetMesh);
        let lowestY = Math.min(sourceLowestY, targetLowestY);
        let sourceHighestY = getHighestYPoint(sourceMesh);
        let targetHighestY = getHighestYPoint(targetMesh);
        let highestY = Math.max(sourceHighestY, targetHighestY);
        let gravity = 0.5;
        if (lowestY != highestY) {
            midpoint.y -= gravity;
        }

        let curve = new THREE.QuadraticBezierCurve3(arrowStart, midpoint, arrowEnd);
        let points = curve.getPoints(50);
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        // let material = new THREE.LineBasicMaterial({
        //     color: color,

        //     // Unlikely to take effect.
        //     // https://threejs.org/docs/?q=LineBasicMaterial#api/en/materials/LineBasicMaterial.linewidth
        //     linewidth: 10
        // });

        let sourceColor = sourceApplication.object.color;
        let targetColor = targetApplication.object.color;

        let flow = connection.flow;
        let inRate = connection.inRate;
        let outRate = connection.outRate;
        if (flow == "in") {
            outRate = 0;
        } else if (flow == "out") {
            inRate = 0;
        }

        let pulsePercentStart = 0.05;
        let intialTime = Math.random();
        let material = new THREE.ShaderMaterial( {
            uniforms: THREE.UniformsUtils.merge( [
                THREE.UniformsLib[ 'fog' ],
                {
                    time: { value: intialTime },
                    sourcePosition: { value: sourceCenter },
                    targetPosition: { value: targetCenter },
                    sourceColor: { value: new THREE.Color(sourceColor) },
                    targetColor: { value: new THREE.Color(targetColor) },
                    pulsePercent: { value: pulsePercentStart },
                    inRate: { value: inRate },
                    outRate: { value: outRate }
                }
            ] ),
            // lights: true,
            fog: true,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        } );

        // Set interval to update the time uniform. This will make the
        // arrow pulse. The interval is set to 10ms and the pulse
        // percent is increased by 0.01 every 10ms. This will make the
        // arrow pulse every 1 second.
        let pulseRate = 1;
        let intervalTime = 10;
        let timeDelta = pulseRate / (1 / (intervalTime / 1000));
        setInterval(() => {
            material.uniforms.time.value += timeDelta;
        }, intervalTime);

        let line = new THREE.Line(geometry, material);
        scene.add(line);
        sceneObjects.push(line);

        // Add the arrow head just before the target.
        let arrowHeadStart = curve.getPoint(1);
        let arrowHeadDirection = curve.getTangent(1);
        arrowHeadDirection.normalize();
        let arrowHead = new THREE.ArrowHelper(arrowHeadDirection, arrowHeadStart, 0, sourceColor, 0.4, 0.2);
        scene.add(arrowHead);
        sceneObjects.push(arrowHead);
    }
}

// ------------------------------------------------------------
// Vertex helper functions.
// ------------------------------------------------------------

// Get the center of a mesh in world space.
function getMeshCenter(mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = new THREE.Vector3();
    box.getCenter(center);
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

// ------------------------------------------------------------
// Event handlers
// ------------------------------------------------------------

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
        let object = component.object;
        let name = component.name;

        let content = document.createElement("article");
        content.classList.add("info-box");
        content.classList.add("start-dark");
        content.classList.add("no-border");

        let colorSection = document.createElement("section");
        colorSection.classList.add("info-box-kv");
        let colorKey = document.createElement("p");
        colorKey.classList.add("key");
        colorKey.textContent = "Color:";
        let colorValue = document.createElement("p");
        colorValue.classList.add("value");
        colorValue.style.color = object.color;
        colorValue.textContent = object.color;
        colorSection.appendChild(colorKey);
        colorSection.appendChild(colorValue);
        
        let positionSection = document.createElement("section");
        positionSection.classList.add("info-box-kv");
        let positionKey = document.createElement("p");
        positionKey.classList.add("key");
        positionKey.textContent = "Position:";
        let positionValue = document.createElement("p");
        positionValue.classList.add("value");
        positionValue.textContent = object.position.join(", ");
        positionSection.appendChild(positionKey);
        positionSection.appendChild(positionValue);
        
        let rotationSection = document.createElement("section");
        rotationSection.classList.add("info-box-kv");
        let rotationKey = document.createElement("p");
        rotationKey.classList.add("key");
        rotationKey.textContent = "Rotation:";
        let rotationValue = document.createElement("p");
        rotationValue.classList.add("value");
        rotationValue.textContent = object.rotation.join(", ");
        rotationSection.appendChild(rotationKey);
        rotationSection.appendChild(rotationValue);
        
        let scaleSection = document.createElement("section");
        scaleSection.classList.add("info-box-kv");
        let scaleKey = document.createElement("p");
        scaleKey.classList.add("key");
        scaleKey.textContent = "Scale:";
        let scaleValue = document.createElement("p");
        scaleValue.classList.add("value");
        scaleValue.textContent = object.scale.join(", ");
        scaleSection.appendChild(scaleKey);
        scaleSection.appendChild(scaleValue);

        // Add buttons to the content that will switch the controls to
        // TransformControls so that the user can manipulate the object.

        // Translate button
        let translateButton = document.createElement("button");
        translateButton.classList.add("button");
        translateButton.textContent = "Translate";
        translateButton.addEventListener("click", () => {
            // Find the object in the selectable objects list with the
            // same name as the selected object. This is because the
            // scene might have been reset and the selected object is
            // a new object.
            let object = findObjectByName(name, selectableObjects);
            setTransformControls(architectureController, object, "translate");
        });
        let translateButtonContainer = document.createElement("div");
        translateButtonContainer.classList.add("info-box-row");
        translateButtonContainer.appendChild(translateButton);

        // Rotate button
        let rotateButton = document.createElement("button");
        rotateButton.classList.add("button");
        rotateButton.textContent = "Rotate";
        rotateButton.addEventListener("click", () => {
            let object = findObjectByName(name, selectableObjects);
            setTransformControls(architectureController, object, "rotate");
        });
        let rotateButtonContainer = document.createElement("div");
        rotateButtonContainer.classList.add("info-box-row");
        rotateButtonContainer.appendChild(rotateButton);

        // Scale button
        let scaleButton = document.createElement("button");
        scaleButton.classList.add("button");
        scaleButton.textContent = "Scale";
        scaleButton.addEventListener("click", () => {
            let object = findObjectByName(name, selectableObjects);
            setTransformControls(architectureController, object, "scale");
        });
        let scaleButtonContainer = document.createElement("div");
        scaleButtonContainer.classList.add("info-box-row");
        scaleButtonContainer.appendChild(scaleButton);

        content.appendChild(colorSection);
        content.appendChild(positionSection);
        content.appendChild(rotationSection);
        content.appendChild(scaleSection);
        content.appendChild(translateButtonContainer);
        content.appendChild(rotateButtonContainer);
        content.appendChild(scaleButtonContainer);

        let popup = new PopupWindow(document.body, component.name, content);
        let popupElement = popup.getWindowElement();
        let popupWidth = popupElement.offsetWidth;

        // Show the popup based on the mouse position.
        let popupX = event.clientX - xPos - (popupWidth / 2);
        let popupY = event.clientY - yPos - 20;
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
    orbitControls.update();
}

// ------------------------------------------------------------
// Scene rendering.
// ------------------------------------------------------------


/**
 * Animates the scene by requesting the next animation frame and
 * rendering the scene.
 */
function animate() {
    requestAnimationFrame( animate );
    render();
}

/**
 * Renders the scene with outlined objects based on the current
 * hover and selection states.
 * 
 * Carefully organise the objects to be outlined so that we
 * do not have the same object outlined twice.
 */
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

// ------------------------------------------------------------
// Helper functions for finding objects and application data.
// ------------------------------------------------------------

/**
 * Finds an object by its name in an array of selectable objects.
 * 
 * @param {string} name - The name of the object to find.
 * @param {Array} selectableObjects - An array of selectable objects.
 * @returns {Object|null} - The object with the specified name, or null if not found.
 */
export function findObjectByName(name, selectableObjects) {
    console.info("findObjectByName: " + name + " selectableObjects: ", selectableObjects);
    for (let i = 0; i < selectableObjects.length; i++) {
        let object = selectableObjects[i];
        if (object.userData.name === name) {
            return object;
        }
    }
    return null;
}

/**
 * Finds an application data object by its name in the given application data.
 * @param {string} name - The name of the application to search for.
 * @param {object} applicationData - The application data object to search in.
 * @returns {object|null} - The found application data object, or null if not found.
 */
export function findApplicationDataByName(name, applicationData) {
    for (let i = 0; i < applicationData.components.length; i++) {
        let application = applicationData.components[i];
        if (application.name === name) {
            return application;
        }
    }
    return null;
}

// ------------------------------------------------------------
// Scene manipulation functions.
// ------------------------------------------------------------

/**
 * Sets the position of the camera.
 * 
 * @param {number[]} position - The position to set the camera to. Should be a 3-element array [x, y, z].
 */
export function setCameraPosition(position) {
    if (position === null) {
        console.error("setCameraPosition: position is null: ", position);
        return;
    }
    if (Object.prototype.toString.call(position) != '[object Array]') {
        console.error("setCameraPosition: position is not an Array: ", position);
        return;
    }
    if (position.length != 3) {
        console.error("setCameraPosition: position is not a 3 element Array: ", position);
        return;
    }

    gsap.to(camera.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 1,
        onUpdate: () => {
            orbitControls.update();
        }
    });
}

/**
 * Retrieves the position of the camera.
 * @returns {number[]} An array containing the x, y, and z coordinates of the camera position.
 */
export function getCameraPosition() {
    return [camera.position.x, camera.position.y, camera.position.z];
}

/**
 * Sets the camera's look-at position.
 * 
 * @param {number[]} position - The position to set the camera's look-at point to. Should be a 3-element array.
 */
export function setCameraLookAt(position) {
    if (position === null) {
        console.error("setCameraLookAt: position is null: ", position);
        return;
    }
    if (Object.prototype.toString.call(position) != '[object Array]') {
        console.error("setCameraLookAt: position is not an Array: ", position);
        return;
    }
    if (position.length != 3) {
        console.error("setCameraLookAt: position is not a 3 element Array: ", position);
        return;
    }

    gsap.to(cameraLookAtPosition, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 1,
        onUpdate: () => orbitControls.update()
    });
    orbitControls.target = cameraLookAtPosition;
}

/**
 * Sets the fog properties of the scene.
 * @param {number} near - The near distance of the fog.
 * @param {number} far - The far distance of the fog.
 */
export function setFog(near, far) {
    scene.fog.near = near;
    scene.fog.far = far;

}

/**
 * Retrieves the value of the 'near' property of the fog in the scene.
 * @returns {number} The value of the 'near' property.
 */
export function getFogNear() {
    return scene.fog.near;
}

/**
 * Retrieves the value of the 'far' property of the fog in the scene.
 * @returns {number} The value of the 'far' property of the fog.
 */
export function getFogFar() {
    return scene.fog.far;
}

/**
 * Sets the text scale for the scene.
 * @param {number} scale - The scale value to set.
 */
export function setTextScale(scale) {
    textScale = scale;
}

/**
 * Retrieves the text scale value.
 * @returns {number} The text scale value.
 */
export function getTextScale() {
    return textScale;
}

/**
 * Sets the rotation of the text objects in the scene.
 * @param {number} rotation - The rotation value in radians.
 */
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

/**
 * Retrieves the value of the text rotation.
 * @returns {number} The value of the text rotation.
 */
export function getTextRotate() {
    return textRotate;
}

/**
 * Rotates the text objects to face the camera.
 */
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

// ------------------------------------------------------------
// Controls functions
// ------------------------------------------------------------

/**
 * Sets up transform controls for an object in the scene.
 * 
 * @param {Object} archController - The architecture controller object.
 * @param {Object3D} object - The object to attach the transform controls to.
 * @param {string} [mode="translate"] - The mode of the transform controls (translate, rotate, or scale).
 */
export function setTransformControls(archController, object, mode="translate") {
    // Remove any existing transform controls. This is to prevent
    // multiple transform controls from being attached to the same
    // object.
    removeTransformControls();

    // A mouse up handler for when the user is done transforming the object.
    // We will fetch the architecture data and update the object with the
    // new position, rotation and scale. We will have to find the object
    // in the architecture data by name.
    let mouseUpHandler = () => {
        let component = object.userData;
        let objectName = component.name;
        let objectPosition = object.position;
        let objectRotation = object.rotation;
        let objectScale = object.scale;
        let position = [objectPosition.x, objectPosition.y, objectPosition.z];
        let rotation = [objectRotation.x, objectRotation.y, objectRotation.z];
        let scale = [objectScale.x, objectScale.y, objectScale.z];

        // Convert the rotation from radians to degrees.
        rotation = rotation.map((value) => {
            return value * 180 / Math.PI;
        });

        // Round the position, rotation and scale to 2 decimal places.
        let roundTo = 2;
        let roundMap = (value) => {
            return Math.round(value * Math.pow(10, roundTo)) / Math.pow(10, roundTo);
        }
        position = position.map(roundMap);
        rotation = rotation.map(roundMap);
        scale = scale.map(roundMap);

        let archData = archController.getArchitectureState();
        let components = archData.components;
        for (let i = 0; i < components.length; i++) {
            let component = components[i];
            if (component.name === objectName) {

                component.object.position = position;
                component.object.rotation = rotation;
                component.object.scale = scale;
                archController.setArchitectureState(archData);
                break;
            }
        }
    };    

    // Add an 'esc' key handler to cancel the transform controls.
    let escKeyHandler = (event) => {
        if (event.key === "Escape") {
            removeTransformControls();
            
            // Stop other 'esc' key handlers from firing.
            event.stopImmediatePropagation();
        }
    };

    transformMouseHandler = mouseUpHandler;
    transformEscHandler = escKeyHandler;

    transformObjectName = object.userData.name;
    eventStack.subscribe("keydown", escKeyHandler);
    transformControls.addEventListener('mouseUp', mouseUpHandler);
    transformControls.attach(object);
    transformControls.enabled = true;
    transformControls.setMode(mode);
}

/**
 * Removes the transform controls and disables their functionality.
 */
export function removeTransformControls() {
    transformObjectName = null;
    eventStack.unsubscribe("keydown", transformEscHandler);
    transformControls.removeEventListener('mouseUp', transformMouseHandler);
    transformControls.detach();
    transformControls.enabled = false;
}
