import * as THREE from 'three';
import './sidebar.js'
import * as alert from './alert.js'
import * as sidebar from './sidebar.js'
import * as sidebarApplicationInfo from './sidebarApplicationInfo.js';

// import Stats from 'three/addons/libs/stats.module.js';
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let container;
let stats;
let renderer, scene, camera;
let composer, renderPass, outlinePass;
let controls;

let mesh;
let light, pointLight;

let alertContainer;

var applicationData = {
    applications: [
        {
            name: "app1",
            color: 0x0287fc,
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
            color: 0x06f7fc,
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


var selectedObjects = [];

const loader = new FontLoader();
loader.load( 'static/css/fonts/Noto_Sans/NotoSans_Regular.json', function ( font ) {
    init(font);
    animate();
} );

function init(font) {
    alert.init();
    sidebar.init();
    sidebarApplicationInfo.init();
    sidebarApplicationInfo.displayApplicationData(applicationData);

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


    generateApplicationMeshes(applicationData, scene, font);

    
    composer = new EffectComposer( renderer );

    renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );
    
    outlinePass = new OutlinePass( new THREE.Vector2( container.clientWidth, container.clientHeight ), scene, camera);
    outlinePass.edgeStrength = 10;
    outlinePass.selectedObjects = selectedObjects;
    composer.addPass( outlinePass );


    
    controls = new ArcballControls( camera, renderer.domElement, scene );
    controls.addEventListener( 'change', render );
    controls.setCamera( camera );
    controls.setGizmosVisible(false);


    light = new THREE.AmbientLight(0x2a2b2b);
    scene.add( light );



    
    window.onresize = function () {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( container.clientWidth, container.clientHeight );
        composer.setSize( container.clientWidth, container.clientHeight );
    };

    
}

function generateApplicationMeshes(applicationData, scene, font) {
    for (var i=0; i < applicationData.applications.length; i++) {
        var application = applicationData.applications[i];

        var name = application.name;
        var color = application.color;
        var position = application.position;
        var servers = application.servers;
        var x = position[0];
        var y = position[1];
        var z = position[2];

        const geometry = new THREE.SphereGeometry( 1, 32, 16 );
        const material = new THREE.MeshStandardMaterial( {
            color: color,
        } );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.set(x, y, z);
        scene.add(mesh);
        selectedObjects.push(mesh);

        pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(x, y + 5, z);
        scene.add(pointLight);

        var textGeo = new TextGeometry(name, {
            font: font,
            size: 1,
            height: 0.2,
            curveSegments: 2,
        } );
        var textMaterial = new THREE.MeshBasicMaterial( {color: color} );
        var textMesh = new THREE.Mesh( textGeo, textMaterial );
        var xOffset = (name.length) / 2 / 1.5; // todo: base this off the size of the geometry
        textMesh.position.set(x - xOffset, y + 2, z);
        scene.add(textMesh);
    }
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