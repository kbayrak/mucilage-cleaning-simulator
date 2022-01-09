import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import * as dat from 'dat.gui'
import {FontLoader, TextGeometry} from "three";


// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects

// Materials



// Mesh


const axesHelper = new THREE.AxesHelper( 10 );
axesHelper.translateY(5);
scene.add( axesHelper );

const size = 50;
const divisions = 20;

const gridHelper = new THREE.GridHelper( size, divisions );
gridHelper.position.y = 5;
scene.add( gridHelper );

const gridGeometry = new THREE.PlaneGeometry(1,1);
const gridMaterial = new THREE.MeshBasicMaterial(
    {
        color: 0x00ff00,
        side: THREE.DoubleSide,
        opacity: 0.5,
        transparent: true
    }
);
const oneGrid = new THREE.Mesh(gridGeometry, gridMaterial);

const redGridMaterial = new THREE.MeshBasicMaterial(
    {
        color: 0xff0000,
        side: THREE.DoubleSide,
        opacity: 0.5,
        transparent: true
    }
)
const newOneGrid = new THREE.Mesh(gridGeometry, redGridMaterial);
newOneGrid.translateY(5)
newOneGrid.translateZ(1.25);
newOneGrid.translateX(1.25);
newOneGrid.scale.set(2.5,2.5,1);
newOneGrid.rotation.x = Math.PI * 0.5;
scene.add(newOneGrid);


function changeCoordinateX(x) {
    return (x*2.5 - 10*2.5 + 1.25);
}

function changeCoordinateY(y) {
    return (-y*2.5 + 10*2.5 -1.25);
}

oneGrid.translateY(5);
oneGrid.translateX(changeCoordinateY(10))
oneGrid.translateZ(changeCoordinateX(10))
oneGrid.scale.set(2.5,2.5,1);

oneGrid.rotation.x = - Math.PI * 0.5;
scene.add(oneGrid);

// Font
const loader = new FontLoader();

loader.load( 'martines-italic.json', function ( font ) {

    const mucilageText = new TextGeometry( 'Mucilage Cleaning Simulator', {
        font: font,
        size: 1,
        height: 1,
        curveSegments: 8,
        bevelEnabled: false,
        bevelThickness: 0.1,
        bevelSize: 0.5,
        bevelOffset: 0,
        bevelSegments: 1
    } );
    mucilageText.center();
    const textM = new THREE.MeshPhongMaterial({
        color: 0xffbbaa,
        specular: 0xffaaaa,
        shininess: 30,
        flatShading: THREE.FlatShading
    });
    const text = new THREE.Mesh(mucilageText, textM);
    text.translateY(5);
    scene.add(text);

} );




/**
 * Floor

 const floor = new THREE.Mesh(
 new THREE.PlaneBufferGeometry(25, 25),
 new THREE.MeshStandardMaterial({
        color: '#1c5cf1',
        metalness: 0,
        roughness: 0.5
    })
 )
 floor.receiveShadow = true
 floor.rotation.x = - Math.PI * 0.5
 scene.add(floor)*/

var clock = new THREE.Clock()
// loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader)
var mixer = null;
gltfLoader.load(
    'map2.2.glb', function (gltf) {
        const oceanMesh = gltf.scene.children.find(child => child.name === 'Ocean')

        oceanMesh.material.transparent=true;
        oceanMesh.material.opacity=0.5;
        mixer = new THREE.AnimationMixer(gltf.scene);

        gltf.animations.forEach((clip) => {
            mixer
                .clipAction(clip)
                .play();
        });

        scene.add(gltf.scene);

        gltf.scene.position.set(8, 0, -6);
    });

var box;
var pivot =new THREE.Group();
gltfLoader.load(
    'ship1.glb', function (ship) {
        ship.scene.position.y =-4.6;
        scene.add(ship.scene);
        box =new THREE.Box3().setFromObject(ship.scene);
        box.center(ship.scene.position);
        ship.scene.position.multiplyScalar(-1);
        scene.add(pivot);
        pivot.add(ship.scene);


    })



// Lights

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set( 0, 8.5, -10)
scene.add(camera)
pivot.add(camera)

// Controls
//const controls = new OrbitControls(camera, canvas)
//controls.target.set(0, 0.75, 0)
//controls.enableDamping = true

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/*
 Keyboard Controls
 */
var keys = {
    a: false,
    s: false,
    d: false,
    w: false
};

document.body.addEventListener( 'keydown', function(e) {

    const key = e.code.replace('Key', '').toLowerCase();
    if ( keys[ key ] !== undefined )
        keys[ key ] = true;

});
document.body.addEventListener( 'keyup', function(e) {

    const key = e.code.replace('Key', '').toLowerCase();
    if ( keys[ key ] !== undefined )
        keys[ key ] = false;

});

/**
 * Animate
 */

var speed,velocity;
const tick = () => {
    requestAnimationFrame(tick)
    let delta = clock.getDelta();
    if (mixer)
        mixer.update(delta)
    speed = 0.0;

    if ( keys.w ){
        pivot.translateZ(0.1);

    }
    else if ( keys.s ){
        pivot.translateZ(-0.1);

    }

    if ( keys.a ){
        pivot.rotateY(0.01);

    }

    else if ( keys.d ){
        pivot.rotateY(-0.01);
    }


    const elapsedTime = clock.getElapsedTime()

    // Update objects

    // Update Orbital Controls
    // controls.update()
    clock=new THREE.Clock();
    delta = clock.getDelta();

    if (mixer != null) {
        mixer.update(delta);
    }
    // Render
    renderer.render(scene, camera)
    camera.lookAt( pivot.position)

    // Call tick again on the next frame

}

tick()

var maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
var nodeStart="4,6";
var nodeEnd="8,13";
function bidirectionalSearch(startKey, targetKey) {
    const startVisited = {};
    const startQueue = [[startKey, null]];
    startVisited[startKey] = null;

    const endVisited = {};
    const endQueue = [[targetKey, null]];
    endVisited[targetKey] = null;

    let currQueue = startQueue;
    let currVisited = startVisited;

    let startParents = {[startKey]: null};
    let endParents = {[targetKey]: null};
    let currParents = startParents;

    while (currQueue.length > 0) {
        const currKeyAndDir = currQueue.shift();
        const currKey = currKeyAndDir[0];
        const dir = currKeyAndDir[1];

        const neighbors = getNeighbors(currKey);
        for (let neighbor in neighbors) {
            if (!(neighbor in currVisited)) {
                currQueue.push([neighbor, neighbors[neighbor]])
                currParents[neighbor] = currKey
                currVisited[neighbor] = neighbors[neighbor];
            }
        }

        if (currKey in startVisited && currKey in endVisited) {
            let startPath = [];
            let endPath = [];
            let startNode = currKey;
            let endNode = currKey;

            while (startNode !== null) {
                if (startNode !== nodeStart) {
                    startPath.unshift([startNode, startVisited[startNode]])
                }
                startNode = startParents[startNode]
            }

            while (endNode !== null) {
                if (endNode !== nodeEnd) {
                    endPath.unshift([endNode, endVisited[endNode]])
                }
                endNode = endParents[endNode]
            }
            //console.log(startPath)
            //console.log(endPath)
            return startPath.concat(endPath);
        }
        currVisited = currVisited === startVisited ? endVisited : startVisited;
        currQueue = currQueue === startQueue ? endQueue : startQueue;
        currParents = currParents === startParents ? endParents : startParents;
    }


}

function getNeighbors(currKey) {
    const [row, col] = keyToPosition(currKey);
    const activeNeighbors = {};
    const currNode = maze[row][col];
    if (row !== 0) {
        if (maze[row - 1][col]) {
            activeNeighbors[positionToKey(row - 1, col)] = 'down';
        }
    }
    if (row !== maze.length - 1) {
        if (maze[row + 1][col]) {
            activeNeighbors[positionToKey(row + 1, col)] = 'up';
        }
    }
    if (col !== 0) {
        if (maze[row][col - 1]) {
            activeNeighbors[positionToKey(row, col - 1)] = 'right';
        }
    }
    if (col !== maze[row].length) {
        if (maze[row][col + 1]) {
            activeNeighbors[positionToKey(row, col + 1)] = 'left';
        }
    }
    return activeNeighbors;
}

function positionToKey(row, col) {
    return row + ',' + col;
}

function keyToPosition(key) {
    return key.split(',').map(Number);
}

var correctPath = bidirectionalSearch(nodeStart,nodeEnd);
console.log(correctPath);

function control() {
    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        switch (event.key) {
            case "l":
                console.log(pivot.position);
                break;

            default:
                return; // Quit when this doesn't handle the key event.
        }

        // Cancel the default action to avoid it being handled twice
        event.preventDefault();
    }, true);
}

control();