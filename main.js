import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Dodaj tło kamery wideo
const video = document.createElement('video');
video.width = window.innerWidth;
video.height = window.innerHeight;
document.body.appendChild(video);

navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
        video.play();
    })
    .catch((error) => {
        console.error('Error accessing video stream:', error);
    });

const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBFormat;

const backgroundMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 0), new THREE.ShaderMaterial({
    uniforms: {
        videoTexture: { value: videoTexture }
    },
    vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
    fragmentShader: `
                uniform sampler2D videoTexture;
                varying vec2 vUv;

                void main() {
                    vec4 videoColor = texture2D(videoTexture, vUv);
                    gl_FragColor = videoColor;
                }
            `
}));
scene.add(backgroundMesh);

const light = new THREE.AmbientLight(0xFFFFFF, 1);
scene.add(light);

const loader = new GLTFLoader();
let model;
let selectedObject = null;
let offset = new THREE.Vector3();

loader.load('aj_biurko.glb', (gltf) => {
    model = gltf.scene;
    model.scale.set(0.05, 0.05, 0.05);
    scene.add(model);

    // Dodaj możliwość przesuwania obiektu
    model.userData.draggable = true;
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

console.log('asd')
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mouseup', onMouseUp, false);

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (selectedObject) {
        const intersects = raycaster.intersectObject(selectedObject);
        if (intersects.length > 0) {
            const intersect = intersects[0];
            const object = intersect.object;

            if (object.userData.draggable) {
                const newPosition = intersect.point.clone().sub(offset);
                object.position.copy(newPosition);
            }
        }
    }
}

function onMouseDown(event) {
    const intersects = getIntersects(event);
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.draggable) {
            selectedObject = object;
            const intersects = getIntersects(event);
            offset.copy(intersects[0].point).sub(selectedObject.position);
        }
    }
}

function onMouseUp() {
    selectedObject = null;
}

function getIntersects(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
    mouse.x = x;
    mouse.y = y;

    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(scene.children, true);
}

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);

    if (model) {
        model.rotation.x += 0.005;
        model.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

animate();