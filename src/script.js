import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import * as dat from 'dat.gui'

let mixer, idleAction;

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects
const geometry = new THREE.TorusGeometry(.7, .2, 16, 100);

// Materials

const material = new THREE.MeshBasicMaterial()
material.color = new THREE.Color(0xff0000)

// Mesh
const sphere = new THREE.Mesh(geometry, material)
sphere.position.y = 1
scene.add(sphere)
console.log(sphere)

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

const size = 51;
const divisions = 20;

const gridHelper = new THREE.GridHelper( size, divisions );
gridHelper.position.y = 4;
scene.add( gridHelper );


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


// loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load(
    'map2.0.glb',
    (gltf) => {
        mixer = new THREE.AnimationMixer( gltf.scene );
        scene.add(gltf.scene)
        idleAction = mixer.clipAction( gltf.animations[ 0 ] )
        console.log(gltf.animations)
        idleAction.play();
        gltf.scene.position.set(8,0,-6);
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(33, 33, 33)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

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

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = .5 * elapsedTime

    // Update Orbital Controls
    controls.update()
    let delta = clock.getDelta();

    if ( mixer ) mixer.update( delta );

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()