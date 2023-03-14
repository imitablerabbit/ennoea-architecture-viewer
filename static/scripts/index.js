import * as THREE from 'three';
import './sidebar.js'
import * as alert from './alert.js'

// import Stats from 'three/addons/libs/stats.module.js';
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

let container;
let stats;
let renderer, scene, camera;
let composer, renderPass, outlinePass;
let controls;

let mesh;
let light, pointLight;


let alertContainer;

init();
animate();

function init() {
    alertContainer = document.getElementById('alert-container');
    alert.init(alertContainer);

    container = document.getElementById('container');

    // stats = new Stats();
    // container.appendChild( stats.dom );

    console.log(container.clientWidth, container.clientHeight);

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( container.clientWidth, container.clientHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );


    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x2a2b2b );
    scene.fog = new THREE.Fog( 0x2a2b2b, 5, 50);


    camera = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000 );
    camera.position.z = 5;


    // Mesh
    const geometry = new THREE.SphereGeometry( 1, 32, 16 );
    // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshStandardMaterial( {
        color: 0x0287fc,
    } );
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    // Add wireframe for the mesh
    // var geoW = new THREE.EdgesGeometry(mesh.geometry);
    // var matW = new THREE.LineBasicMaterial({
    //     color: 0x000000,
    //     linewidth: 3
    // });
    // var wireframe = new THREE.LineSegments(geoW, matW);
    // mesh.add(wireframe);

    
    composer = new EffectComposer( renderer );

    renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );
    
    outlinePass = new OutlinePass( new THREE.Vector2( container.clientWidth, container.clientHeight ), scene, camera);
    outlinePass.edgeStrength = 10;
    // outlinePass.edgeThickness = 10;
    // outlinePass.edgeGlow = 0.5;
    // outlinePass.visibleEdgeColor = 0xffffff;
    // outlinePass.hiddenEdgeColor = 0x000000;
    outlinePass.selectedObjects = [mesh];
    composer.addPass( outlinePass );


    
    controls = new ArcballControls( camera, renderer.domElement, scene );
    controls.addEventListener( 'change', render );
    controls.setCamera( camera );
    controls.setGizmosVisible(false);


    light = new THREE.AmbientLight(0x2a2b2b);
    scene.add( light );

    pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(20,20,20);
    scene.add( pointLight );

    
    window.onresize = function () {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( container.clientWidth, container.clientHeight );
        composer.setSize( container.clientWidth, container.clientHeight );
    };

    
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    // stats.update();
    render();
}

function render() {
    composer.render();
}