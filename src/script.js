import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import * as dat from 'dat.gui'
import {FontLoader, Group, TextGeometry, Vector3} from "three";

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects

// Materials

// Mesh


const axesHelper = new THREE.AxesHelper( 10 );
axesHelper.translateY(6);
scene.add( axesHelper );

const size = 50;
const divisions = 20;

const gridHelper = new THREE.GridHelper( size, divisions );
gridHelper.position.y = 5;
scene.add( gridHelper );

var tiles=[];
const tileGeometry = new THREE.PlaneGeometry(2.5,2.5);
function addTile(x, z, y, color) {
    const tileMaterial = new THREE.MeshBasicMaterial(
        {
            color: color,
            side: THREE.DoubleSide,
            polygonOffset: true,
            opacity: 0.5,
            transparent: true
        }
    )
    const newTile = new THREE.Mesh(tileGeometry, tileMaterial);
    newTile.translateX(game2worldCoordX(x));
    newTile.translateZ(game2worldCoordZ(z));
    newTile.translateY(y);
    newTile.rotation.x = - Math.PI * 0.5;
    newTile.scale.set(0.1,0.1,0.1);
    scene.add(newTile);
    tiles.push(newTile)
    let idTile = requestAnimationFrame(animateTile);
    let scaleSize = 0.1;
    function animateTile(){
        if (scaleSize>=1.0){
            this.cancelAnimationFrame(idTile);
        }
        requestAnimationFrame(animateTile);
        newTile.scale.set(scaleSize,scaleSize,scaleSize);
        scaleSize+=0.01;
    }
}
function clearTiles(){
    for (let tile of tiles ){
        scene.remove(tile);
        tile.geometry.dispose();
        tile.material.dispose();
        tile = undefined;
    }
}

function game2worldCoordZ(z) {
    return (z*2.5 - 10*2.5 + 1.25);
}
function game2worldCoordX(x) {
    return (-x*2.5 + 10*2.5 -1.25);
}
function world2gameCoordZ(z) {
    return ((z + 10*2.5 - 1.25) / 2.5);
}
function world2gameCoordX(x) {
    return ((x - 10*2.5 + 1.25) / -2.5);
}

function getWorldCenter(z) {
    let kalan = z % 5;
    let bolum = Math.floor(z/5);
    if (z > 0) {
        if (kalan >= 2.5) {
            return (bolum + 1) * 5 - 1.25;
        } else {
            return (bolum * 5) + 1.25;
        }
    } else {
        if (kalan <= -2.5) {
            return (bolum) * 5 + 1.25;
        } else {
            return (bolum + 1) * 5 - 1.25;
        }

    }
}

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
    text.translateY(7);
    text.translateZ(25)
    scene.add(text);

} );

var clock = new THREE.Clock()
// loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader)
var mixer = null;
var mixer1=null;
gltfLoader.load(
    'map2.2.glb', function (gltf) {
        const oceanMesh = gltf.scene.children.find(child => child.name === 'Ocean');
        oceanMesh.material.transparent=true;
        oceanMesh.material.opacity=0.7;

        const bottomMesh = gltf.scene.children.find(child => child.name === 'BottomOfMap');
        bottomMesh.receiveShadow = true;

        mixer = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => {
            mixer
                .clipAction(clip)
                .play();
        });

        scene.add(gltf.scene);

        gltf.scene.position.set(8, 0, -6);
    });

var fishGroup = new Group;
gltfLoader.load(
    'fish1.glb', function (fish1) {
        mixer1 = new THREE.AnimationMixer(fish1.scene);
        fish1.scene.scale.set(1.5,1.5,1.5);
        fish1.scene.position.set(4, 2, -2);
        fish1.animations.forEach((clip) => {
            mixer1
                .clipAction(clip)
                .play();
        });
        fishGroup.add(fish1.scene);
        scene.add(fishGroup);

    });

var box;
var pivot =new THREE.Group();
gltfLoader.load(
    'ship1.glb', function (ship) {
        ship.scene.position.y =-4.6;
        scene.add(ship.scene);
        box =new THREE.Box3().setFromObject(ship.scene);
        box.getCenter(ship.scene.position);
        ship.scene.position.multiplyScalar(-1);
        const axesHelper = new THREE.AxesHelper( 1 );
        axesHelper.translateY(5);
        scene.add(pivot);
        pivot.add(axesHelper);
        pivot.add(ship.scene);


    })


gltfLoader.load(
    "rock_1x2_1.glb", function (rock){

        rock.scene.position.set(game2worldCoordX(6),4.6,(game2worldCoordZ(6)+game2worldCoordZ(7))/2);

        rock.scene.scale.set(0.7,0.8,0.7);
        scene.add(rock.scene);
    }
)
gltfLoader.load(
    "kizkulesi.glb", function (kizK){

        kizK.scene.position.set(game2worldCoordX(8),4.5,(game2worldCoordZ(10)+game2worldCoordZ(11))/2);

        kizK.scene.scale.set(0.1,0.15,0.1);
        scene.add(kizK.scene);
    }
)

gltfLoader.load(
    "musilage.glb", function (musilage) {

        musilage.scene.position.set(game2worldCoordZ(5), 4.1, game2worldCoordZ(9));
        musilage.scene.scale.set(1, 1,1);
        scene.add(musilage.scene);
    }
)

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
let cameraPos = new Vector3(0,8.5,-9);
camera.position.set(cameraPos.x,cameraPos.y,cameraPos.z);
//camera.position.set( 0, 18.5, -5)
scene.add(camera)
pivot.add(camera)
let cameraStatus = 0;

function camChange(camMode) {
    if (camMode === 1) {
        cameraStatus = 1;
        pivot.remove(camera);
        scene.add(camera);
    } else if (camMode === 0) {
        cameraStatus = 0;
        scene.remove(camera);
        pivot.add(camera);
    }

}

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enabled = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    logarithmicDepthBuffer: true
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

var speed;
const tick = () => {
    requestAnimationFrame(tick)
    let delta = clock.getDelta();
    if (mixer)
        mixer.update(delta)
    if (mixer1)
        mixer1.update(delta)

    speed = 0.0;

    if ( keys.w ){
        pivot.translateZ(0.1);

    }
    else if ( keys.s ){
        pivot.translateZ(-0.1);

    }

    if ( keys.a ){
        pivot.rotateY(0.02);

    }

    else if ( keys.d ){
        pivot.rotateY(-0.02);
    }

    // Render
    // if (controls.enabled === false) {
    //     camera.lookAt( pivot.position);
    // }
    let copyPivot;

    if (cameraStatus === 0 )
        if (controls.enabled === false) {
            camera.lookAt(pivot.position);
        }
    else if (cameraStatus === 1) {
            if (controls.enabled === false) {
                camera.lookAt(0,0,0);
            }
        }
    // Call tick again on the next frame
    if (cameraStatus === 1) {
        let yDelta = 45 - camera.position.y;
        let zDelta = 0 - camera.position.z;
        let xDelta = 0 - camera.position.x;

        if (camera.position.y < 44.9) {
            if (controls.enabled === false) {
                camera.position.y += yDelta / 100;
                camera.position.z += zDelta / 100;
                camera.position.x += xDelta / 100;
                camera.lookAt(0,0,0);
            }
        }
    }
    else if(cameraStatus===0){
        let yDelta = cameraPos.y - camera.position.y;
        let zDelta = cameraPos.z - camera.position.z;
        let xDelta = cameraPos.x - camera.position.x;
        if (camera.position.y>cameraPos.y+0.1){
            if (controls.enabled === false) {
                camera.position.y += yDelta / 100;
                camera.position.z += zDelta / 100;
                camera.position.x += xDelta / 100;
            }
        }
    }
    let randomRotate = Math.random()*0.1;
    fishGroup.rotateY(Math.PI/180*randomRotate);
    fishGroup.translateX(-0.005)
    renderer.render(scene, camera)
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


var nodeStart= world2gameCoordZ(getWorldCenter(pivot.position.z)).toString() + "," + world2gameCoordX(getWorldCenter(pivot.position.x)).toString();
var nodeEnd="8,13";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function bidirectionalSearch(startKey, targetKey) {
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
        const [row, col] = keyToPosition(currKey);

        addTile(row,col,5, 0x00ff00);
        await sleep(50);

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
            //clearTiles();
            let correctPath = startPath.concat(endPath);
            correctPath.pop();
            for (let item of correctPath) {
                const [x,z] = keyToPosition(item[0]);
                addTile(x,z,5.01, 0x0000ff);
                await sleep(50);
            }
            return correctPath;
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

//var correctPath = bidirectionalSearch(nodeStart,nodeEnd);

function control() {
    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        switch (event.key) {
            case "l":
                console.log(pivot.position);
                console.log(world2gameCoordX(pivot.position.x), world2gameCoordZ(pivot.position.z));
                console.log("getWorldCenter z:",getWorldCenter(pivot.position.z),"x:", getWorldCenter(pivot.position.x));
                console.log("world2gameCoordZ z:", world2gameCoordZ(getWorldCenter(pivot.position.z)),
                    "world2gameCoordX x:", world2gameCoordX(getWorldCenter(pivot.position.x)));
                console.log("nodeStart:", nodeStart);
                console.log()
                break;
            case " ":
                clearTiles();
                nodeStart = world2gameCoordX(getWorldCenter(pivot.position.x)).toString() + "," + world2gameCoordZ(getWorldCenter(pivot.position.z)).toString();
                bidirectionalSearch(nodeStart,nodeEnd)
                break;
            case "c":
                if (cameraStatus === 0)
                    camChange(1);
                else if (cameraStatus === 1)
                    camChange(0);
                break;
            case "q":
            //removeMusilage();
            default:
                return; // Quit when this doesn't handle the key event.
        }

        // Cancel the default action to avoid it being handled twice
        event.preventDefault();
    }, true);
}

control();

// Debug

const guiOptions = {
    orbitControl: false
}

const gui = new dat.GUI()

const cameraGui = gui.addFolder("Camera Settings");
cameraGui.add(camera.position, "x", -10, 10).name("Position X").listen();
cameraGui.add(camera.position, "y", -10, 10).name("Position Y").listen();
cameraGui.add(camera.position, "z", -10, 10).name("Position Z").listen();
cameraGui.add(guiOptions, "orbitControl").name("Orbit Control").listen().onChange(function () {
    controls.enabled === false ? controls.enabled = true : controls.enabled = false;
    controls.enabled === false ? orbitChangeOnClick(false) : orbitChangeOnClick(true);
});
cameraGui.open();

function orbitChangeOnClick(bool) {
    if (bool) {
        pivot.remove(camera);
        scene.add(camera);
    } else {
        scene.remove(camera);
        pivot.add(camera);
        camera.position.set(0, 8.5, -9);
    }
}