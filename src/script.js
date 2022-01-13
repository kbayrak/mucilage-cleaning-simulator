import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import * as dat from 'dat.gui'
import {FontLoader, Group, TextGeometry, Vector2, Vector3} from "three";
import requestAnimationFrame from "dat.gui/src/dat/utils/requestAnimationFrame";

const listener = new THREE.AudioListener();
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load("sound/seagull.m4a", function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.2);
    sound.play();
});

const loadingManager = new THREE.LoadingManager( () => {

    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen.classList.add( 'fade-out' );

    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener( 'transitionend', onTransitionEnd );

} );

function onTransitionEnd( event ) {

    const element = event.target;
    element.remove();

}
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();


var cubegeo = new THREE.BoxGeometry(1000, 1000, 1000);
var cube_materials = [
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("image/venice/px.png"),
        side: THREE.DoubleSide,
    }),
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("image/venice/nx.png"),
        side: THREE.DoubleSide,
    }),
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("image/venice/py.png"),
        side: THREE.DoubleSide,
    }),
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("image/venice/ny.png"),
        side: THREE.DoubleSide,
    }),
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("image/venice/pz.png"),
        side: THREE.DoubleSide,
    }),
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("image/venice/nz.png"),
        side: THREE.DoubleSide,
    }),
];

var cubeMaterial = new THREE.MeshFaceMaterial(cube_materials);
var cube = new THREE.Mesh(cubegeo, cubeMaterial);
scene.add(cube);

// Objects

// Materials

// Mesh


const size = 50;
const divisions = 20;

const gridHelper = new THREE.GridHelper( size, divisions );
gridHelper.position.y = 4;
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
    let remainder = z % 5;
    let quotient = Math.floor(z/5);
    if (z > 0) {
        if (remainder >= 2.5) {
            return (quotient + 1) * 5 - 1.25;
        } else {
            return (quotient * 5) + 1.25;
        }
    } else {
        if (remainder <= -2.5) {
            return (quotient) * 5 + 1.25;
        } else {
            return (quotient + 1) * 5 - 1.25;
        }

    }
}



const clock = new THREE.Clock()
// loader
let mixer = null;
let mixer1= null;
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('draco/')
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader)

loadMap();
fish1Loader(0,5);
fish1Loader(10, 2);

const fishGroup = new Group;
let box;
const pivot =new THREE.Group();

let dirtiesArray = [];

// Lights

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight);

let spotLightIntensity = 1;
let spotLightColor = 0xffffff;
const spotLight = new THREE.SpotLight(spotLightColor, spotLightIntensity);
spotLight.position.set(0,10,0);
spotLight.target.position.set(0,0,0);
scene.add(spotLight);
scene.add(spotLight.target);
spotLight.visible = false;


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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
let cameraPos = new Vector3(0, 5.5, -3.5);
camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
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

    if (keys.w) {
        if(pivot.position.x+1.3>=25){
            pivot.position.x-=0.1;
        }else if(pivot.position.x-1.3<=-25){
            pivot.position.x+=0.1;
        }if (pivot.position.z+1.3>=25){
            pivot.position.z-=0.1;
        }else if(pivot.position.z-1.3<=-25){
            pivot.position.z+=0.1;
        }
        if(maze[world2gameCoordX(getWorldCenter(pivot.position.x+1.25))]
            [world2gameCoordZ(getWorldCenter(pivot.position.z))]===0){
            pivot.position.x-=0.1;
        }if(maze[world2gameCoordX(getWorldCenter(pivot.position.x-1.25))]
            [world2gameCoordZ(getWorldCenter(pivot.position.z))]===0){
            pivot.position.x+=0.1;
        }if(maze[world2gameCoordX(getWorldCenter(pivot.position.x))]
            [world2gameCoordZ(getWorldCenter(pivot.position.z+1.25))]===0){
            pivot.position.z-=0.1;
        }if(maze[world2gameCoordX(getWorldCenter(pivot.position.x))]
            [world2gameCoordZ(getWorldCenter(pivot.position.z-1.25))]===0){
            pivot.position.z+=0.1;
        }

        pivot.translateZ(0.1);

    } else if (keys.s) {
        if(pivot.position.x+1.3>=25){
            pivot.position.x-=0.1;
        }else if(pivot.position.x-1.3<=-25){
            pivot.position.x+=0.1;
        }if (pivot.position.z+1.3>=25){
            pivot.position.z-=0.1;
        }else if(pivot.position.z-1.3<=-25){
            pivot.position.z+=0.1;
        }
        if(maze[world2gameCoordX(getWorldCenter(pivot.position.x+1.25))]
            [world2gameCoordZ(getWorldCenter(pivot.position.z))]===0){
            pivot.position.x-=0.1;
        }if(maze[world2gameCoordX(getWorldCenter(pivot.position.x-1.25))]
            [world2gameCoordZ(getWorldCenter(pivot.position.z))]===0){
            pivot.position.x+=0.1;
        }if(maze[world2gameCoordX(getWorldCenter(pivot.position.x))]
            [world2gameCoordZ(getWorldCenter(pivot.position.z+1.25))]===0){
            pivot.position.z-=0.1;
        }if(maze[world2gameCoordX(getWorldCenter(pivot.position.x))]
            [world2gameCoordZ(getWorldCenter(pivot.position.z-1.25))]===0){
            pivot.position.z+=0.1;
        }
        pivot.translateZ(-0.05);

    }

    if (keys.a) {
        pivot.rotateY(0.02);

    } else if (keys.d) {
        pivot.rotateY(-0.02);
    }

    // Render
    // if (controls.enabled === false) {
    //     camera.lookAt( pivot.position);
    // }
    let copyPivot = pivot.clone();
    copyPivot.translateZ(8);

    if (cameraStatus === 0)
        if (controls.enabled === false) {
            camera.lookAt(copyPivot.position);
        } else if (cameraStatus === 1) {
            if (controls.enabled === false) {
                camera.lookAt(0, 0, 0);
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
                camera.lookAt(0, 0, 0);
            }
        }
    } else if (cameraStatus === 0) {
        let yDelta = cameraPos.y - camera.position.y;
        let zDelta = cameraPos.z - camera.position.z;
        let xDelta = cameraPos.x - camera.position.x;
        if (camera.position.y > cameraPos.y + 0.1) {
            if (controls.enabled === false) {
                camera.position.y += yDelta / 100;
                camera.position.z += zDelta / 100;
                camera.position.x += xDelta / 100;
            }
        }
    }
    let randomRotate = Math.random() * 0.1;
    fishGroup.rotateY(Math.PI / 180 * randomRotate);
    fishGroup.translateX(-0.005)
    renderer.render(scene, camera)
}

tick()

var maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1]
];
let rock1x1Coords=[[5,2],[7,16],[11,18],[15,16]];
let rock2x1Coords=[[4,9,10],[8,11,12],[8,13,14]];
let rock2x2Coords=[[0,1,4,5],[9,10,5,6],[15,16,4,5],[15,16,6,7]];
let mucilageCoords=[[1,8],[6,5],[9,1],[13,5],[11,11],[4,14],[13,15]];
let maidenTowerCoords=[13,14,10,11];
let snotCoords=[[3,0],[13,0],[19,3],[19,8],[19,17]];

for (let i=0 ; i<rock1x1Coords.length; i++){
    maze[rock1x1Coords[i][0]][rock1x1Coords[i][1]]=0;
    rock1x1Loader1(rock1x1Coords[i][0],rock1x1Coords[i][1]);
}
for (let i=0 ;  i<rock2x1Coords.length;i++){
    maze[rock2x1Coords[i][0]][rock2x1Coords[i][1]]=0;
    maze[rock2x1Coords[i][0]][rock2x1Coords[i][2]]=0;
    rock2x1Loader1(rock2x1Coords[i][0],rock2x1Coords[i][0],rock2x1Coords[i][1],rock2x1Coords[i][2]);
}
for (let i=0; i<rock2x2Coords.length;i++){
    maze[rock2x2Coords[i][0]][rock2x2Coords[i][2]]=0;
    maze[rock2x2Coords[i][0]][rock2x2Coords[i][3]]=0;
    maze[rock2x2Coords[i][1]][rock2x2Coords[i][2]]=0;
    maze[rock2x2Coords[i][1]][rock2x2Coords[i][3]]=0;
    rock2x2Loader1(rock2x2Coords[i][0],rock2x2Coords[i][1],rock2x2Coords[i][2],rock2x2Coords[i][3]);
}
maze[maidenTowerCoords[0]][maidenTowerCoords[2]]=0;
maze[maidenTowerCoords[0]][maidenTowerCoords[3]]=0;
maze[maidenTowerCoords[1]][maidenTowerCoords[2]]=0;
maze[maidenTowerCoords[1]][maidenTowerCoords[3]]=0;
maidensTowerLoader(maidenTowerCoords[0],maidenTowerCoords[1],maidenTowerCoords[2],maidenTowerCoords[3]);

for (let i=0 ; i<mucilageCoords.length; i++){
    mucilageLoader(mucilageCoords[i][0],mucilageCoords[i][1]);
}
for (let i=0 ; i<snotCoords.length; i++){
    snotLoader(snotCoords[i][0],snotCoords[i][1]);

}


console.log(dirtiesArray)
let dirties = mucilageCoords.concat(snotCoords);

var distances=[];
function calulateDistance(dirties){
    for (var coord=0;coord<dirties.length;coord++){
        distances[coord]=new Vector2(world2gameCoordX(pivot.position.x),world2gameCoordZ(pivot.position.z))
            .distanceTo(new Vector2(dirties[coord][0],dirties[coord][1]));
    }
    for (var i=0;i<distances.length;i++){
        if (Math.min(...distances)===distances[i]){
            console.log("calculate return: ", i)
            distances=[];
            return i;
        }
    }
}

function clearMucilage(){
    let closeIndex = calulateDistance(dirties);
    let dirtIndex = closeIndex;
    let closest = dirties[closeIndex];
    let shipLoc = [world2gameCoordX(getWorldCenter(pivot.position.x)),world2gameCoordZ(getWorldCenter(pivot.position.z))];
    let idDirty;
    if (closest.toString()===shipLoc.toString()){
        let x1=shipLoc[0];
        let x2=shipLoc[1];
        console.log(dirtiesArray)
        for (let i=0;i<dirtiesArray.length;i++){
            console.log("x1: ",x1,"x2: ",x2)
            console.log(world2gameCoordX(dirtiesArray[i].children[0].position.x),world2gameCoordX(dirtiesArray[i].children[0].position.z))
            if ((world2gameCoordX(dirtiesArray[i].children[0].position.x)===x1)){
                if(world2gameCoordZ(dirtiesArray[i].children[0].position.z)===x2){
                    closeIndex=i;
                    console.log("dkjdskfjsdf")
                }

            }
        }
        idDirty = requestAnimationFrame(cleanAnim);
        //dirtiesArray.splice(closeIndex,1);
        dirties.splice(dirtIndex,1);
    }

    let scaleDirtyX = dirtiesArray[closeIndex].children[0].scale.x/100;
    let scaleDirtyY = dirtiesArray[closeIndex].children[0].scale.y/100;
    let scaleDirtyZ = dirtiesArray[closeIndex].children[0].scale.z/100;
    function cleanAnim(){

        if(dirtiesArray[closeIndex].children[0].scale.x<=0){
            if (dirties.length===0){
                cameraStatus=1;
                // Font
                const loader = new FontLoader(loadingManager);

                loader.load('font/martines-italic.json', function (font) {

                    const mucilageText = new TextGeometry('Mucilage Cleaning Simulator\n        Congratulations', {
                        font: font,
                        size: 6,
                        height: 6,
                        curveSegments: 8,
                        bevelEnabled: false,
                        bevelThickness: 0.1,
                        bevelSize: 0.5,
                        bevelOffset: 0,
                        bevelSegments: 1
                    });
                    mucilageText.center();
                    const textM = new THREE.MeshPhongMaterial({
                        color: 0xbdc2c9,
                        specular: 0xbdc2c9,
                        shininess: 30,
                        flatShading: THREE.FlatShading
                    });
                    const text = new THREE.Mesh(mucilageText, textM);
                    text.translateY(7);
                    text.rotation.x=Math.PI/180* 90;
                    text.rotation.y=Math.PI/180 *180;
                    scene.add(text);

                });
            };
            this.cancelAnimationFrame(idDirty);
            return;
        }
        else{
            dirtiesArray[closeIndex].children[0].scale.x-=scaleDirtyX;
            dirtiesArray[closeIndex].children[0].scale.y-=scaleDirtyY;
            dirtiesArray[closeIndex].children[0].scale.z-=scaleDirtyZ;
            requestAnimationFrame(cleanAnim);
        }


    }
}

shipLoader();
var nodeStart = world2gameCoordZ(getWorldCenter(pivot.position.z)).toString() + "," + world2gameCoordX(getWorldCenter(pivot.position.x)).toString();
var nodeEnd = "19,19";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function bidirectionalSearch(startKey, targetKey) {
    camChange(1);
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

        addTile(row, col, 4.25, 0x00ff00);
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
                const [x, z] = keyToPosition(item[0]);
                addTile(x, z, 4.26, 0x0000ff);
                await sleep(50);
            }
            await sleep(200);
            camChange(0);
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
        switch (event.code) {
            case "KeyL":
                console.log(pivot.position);
                console.log(world2gameCoordX(pivot.position.x), world2gameCoordZ(pivot.position.z));
                console.log("getWorldCenter z:", getWorldCenter(pivot.position.z), "x:", getWorldCenter(pivot.position.x));
                console.log("world2gameCoordZ z:", world2gameCoordZ(getWorldCenter(pivot.position.z)),
                    "world2gameCoordX x:", world2gameCoordX(getWorldCenter(pivot.position.x)));
                console.log("nodeStart:", nodeStart);
                console.log()
                break;
            case "Space":
                clearTiles();
                nodeStart = world2gameCoordX(getWorldCenter(pivot.position.x)).toString() + "," + world2gameCoordZ(getWorldCenter(pivot.position.z)).toString();
                nodeEnd=positionToKey(dirties[calulateDistance(dirties)][0],dirties[calulateDistance(dirties)][1]);
                bidirectionalSearch(nodeStart, nodeEnd)
                break;
            case "KeyC":
                if (cameraStatus === 0)
                    camChange(1);
                else if (cameraStatus === 1)
                    camChange(0);
                break;
            case "KeyQ":
                clearMucilage();

                break;
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
    orbitControl: false,
    spotLight: false

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
cameraGui.add(guiOptions, "spotLight").name("Spotlight").listen().onChange(
    function () {
    spotLight.visible = guiOptions.spotLight === true;
}
);
cameraGui.open();

const spotlightIntensity = gui.addFolder("Spotlight Intensity");
spotlightIntensity.add(spotLight,"intensity", 0 ,2, 0.01 ).name("Intensity").listen();
const spotlightPosition = gui.addFolder("Spotlight Position");
spotlightPosition.add(spotLight.position,"x", -25, 25, 0.1).name("Position X").listen();
spotlightPosition.add(spotLight.position, "y", 5, 25, 0.1).name("Position Y").listen();
spotlightPosition.add(spotLight.position, "z", -25, 25, 0.1).name("Position Z").listen();
const spotLightTarget = gui.addFolder("Spotlight Target");
spotLightTarget.add(spotLight.target.position, "x", -10, 10, 0.1).name("Target X").listen();
spotLightTarget.add(spotLight.target.position, "y", -10, 10, 0.1).name("Target Y").listen();
spotLightTarget.add(spotLight.target.position, "z", -10, 10, 0.1).name("Target Z").listen();



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

// GLTF Loaders
function loadMap() {
    gltfLoader.load(
        'objects/map2.2.glb', function (gltf) {
            const oceanMesh = gltf.scene.children.find(child => child.name === 'Ocean');
            oceanMesh.material.transparent = true;
            oceanMesh.material.opacity = 0.7;

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
}

function fish1Loader(x, z) {
    gltfLoader.load(
        'objects/fish1.glb', function (fish1) {
            mixer1 = new THREE.AnimationMixer(fish1.scene);
            fish1.scene.scale.set(1.5, 1.5, 1.5);
            fish1.scene.position.set(x, 2, z);
            fish1.animations.forEach((clip) => {
                mixer1
                    .clipAction(clip)
                    .play();
            });
            fishGroup.add(fish1.scene);
            scene.add(fishGroup);

        });
}

function shipLoader() {
    gltfLoader.load(
        'objects/ship1.glb', function (ship) {
            ship.scene.position.y = -4.6;
            scene.add(ship.scene);
            box = new THREE.Box3().setFromObject(ship.scene);
            box.getCenter(ship.scene.position);
            ship.scene.position.multiplyScalar(-1);
            scene.add(pivot);
            pivot.add(ship.scene);
            pivot.position.set(game2worldCoordX(1), 0, game2worldCoordZ(17));
            pivot.rotateY(Math.PI / 180 * 180);
        })
}

function rock2x1Loader1(x1, x2, z1, z2) {
    gltfLoader.load(
        "objects/rock_1x2_1.glb", function (rock) {

            rock.scene.position.set((game2worldCoordX(x1) + game2worldCoordX(x2)) / 2, 3.5, (game2worldCoordZ(z1) + game2worldCoordZ(z2)) / 2);

            rock.scene.scale.set(0.7, 0.8, 0.7);
            scene.add(rock.scene);
        }
    )
}
function maidensTowerLoader(x1,x2,z1,z2){
    gltfLoader.load(
        "objects/kizkulesi.glb", function (kizK) {

            kizK.scene.position.set((game2worldCoordX(x1) + game2worldCoordX(x2)) / 2 - .42, 4.1, (game2worldCoordZ(z1) + game2worldCoordZ(z2)) / 2 + 0.05);

            kizK.scene.scale.set(0.18, 0.16, 0.13);
            scene.add(kizK.scene);
        }
    )
}
function mucilageLoader(x,z){
    gltfLoader.load(
        "objects/musilage.glb", function (musilage) {

            musilage.scene.position.set(game2worldCoordX(x), 4.1, game2worldCoordZ(z));
            musilage.scene.scale.set(2, 1, 2);
            let mucilageGroup = new Group();
            mucilageGroup.add(musilage.scene)
            dirtiesArray.push(mucilageGroup);

            scene.add(mucilageGroup);
        }
    )
}
function snotLoader(x,z){
    gltfLoader.load(
        "objects/snot.glb", function (snot) {

            snot.scene.position.set(game2worldCoordX(x), 4.1, game2worldCoordZ(z));
            snot.scene.scale.set(1.2, 1, 1.2);
            let snotGroup = new Group();
            snotGroup.add(snot.scene)
            dirtiesArray.push(snotGroup);
            scene.add(snotGroup);
        }
    )
}
function rock1x1Loader1(x1, z1) {
    gltfLoader.load(
        "objects/rock1x1_1.glb", function (rock1x1) {

            rock1x1.scene.position.set(game2worldCoordX(x1), 3, game2worldCoordZ(z1));

            rock1x1.scene.scale.set(0.5, 0.3, 0.7);
            scene.add(rock1x1.scene);
        }
    )
}

function rock2x2Loader1(x1, x2, z1, z2) {
    gltfLoader.load(
        "objects/island2x2.glb", function (island) {
            island.scene.position.set((game2worldCoordX(x1) + game2worldCoordX(x2)) / 2, 4, (game2worldCoordZ(z1) + game2worldCoordZ(z2)) / 2);
            island.scene.scale.set(0.5, 0.8, 0.7);
            scene.add(island.scene);
        }
    )
}
