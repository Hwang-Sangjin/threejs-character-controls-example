import { KeyDisplay } from './utils';
import { CharacterControls } from './characterControls';
import * as THREE from 'three'
import { CameraHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 5;
camera.position.z = 5;
camera.position.x = 0;

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true

// CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 15
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update();

// LIGHTS
light()



// MODEL WITH ANIMATIONS
var characterControls: CharacterControls

const textureLoader = new THREE.TextureLoader()
 const dogTexture = textureLoader.load('models/dog/PolyArt_Dogs_color.png')

 
const fbxLoader = new FBXLoader()

fbxLoader.load(
    '/models/map/Mapmap2.fbx',
    (fbx) =>
    {
        
        //fbx.children[0].material = bakedMaterial
        // fbx.scene.traverse((child)=>{
        //     child.material = bakedMaterial
        // })
        fbx.position.set(0,0,0)
        fbx.scale.set(0.05, 0.05, 0.05)
        scene.add(fbx)
    }
)

//dog

fbxLoader.load(
    '/models/dog/Lowpoly_Akita_IP.fbx',
    (fbx) =>
    {
        console.log(fbx.animations)
        const bakedMaterial = new THREE.MeshBasicMaterial({map: dogTexture})
        //@ts-ignore
        fbx.children[0].material = bakedMaterial
        //fbx.children[0].material = bakedMaterial
        //const bakedMaterial = new THREE.MeshBasicMaterial({map: floor02Texture})
        //fbx.children[0].material = bakedMaterial
        // fbx.scene.traverse((child)=>{
        //     child.material = bakedMaterial
        // })
        fbx.position.set(-20,1.2,10)
        fbx.rotation.set(0,90,0)
        fbx.scale.set(2, 2, 2)
        scene.add(fbx)

        const fbxAnimations = fbx.animations
        const mixer = new THREE.AnimationMixer(fbx)
        const animationsMap = new Map()
        fbxAnimations.filter(a => a.name !='TPose').forEach((a)=> {
            animationsMap.set(a.name, mixer.clipAction(a))
        })

        characterControls = new CharacterControls(fbx,mixer,animationsMap,orbitControls,camera,'Arm_Dog|idle_1')
    }
)


// CONTROL KEYS
const keysPressed = {  }
const keyDisplayQueue = new KeyDisplay();
document.addEventListener('keydown', (event) => {
    keyDisplayQueue.down(event.key)
    if (event.shiftKey && characterControls) {
        characterControls.switchRunToggle()
    } else {
        (keysPressed as any)[event.key.toLowerCase()] = true
    }
}, false);
document.addEventListener('keyup', (event) => {
    keyDisplayQueue.up(event.key);
    (keysPressed as any)[event.key.toLowerCase()] = false
}, false);

const clock = new THREE.Clock();
// ANIMATE
function animate() {
    let mixerUpdateDelta = clock.getDelta();
    if (characterControls) {
        characterControls.update(mixerUpdateDelta, keysPressed);
    }
    orbitControls.update()
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);
animate();

// RESIZE HANDLER
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    keyDisplayQueue.updatePosition()
}
window.addEventListener('resize', onWindowResize);


function light() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(- 60, 100, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);
    // scene.add( new THREE.CameraHelper(dirLight.shadow.camera))
}