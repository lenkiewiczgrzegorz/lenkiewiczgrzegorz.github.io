import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xFFFFFF, 1);
scene.add(light);

let model;

const loader = new GLTFLoader();
loader.load('desk1/scene.gltf', (gltf) => {
    model = gltf.scene;
    model.scale.set(1, 1, 1);
    scene.add(model);
});

const controls = {
    rotateX: () => { if (model) model.rotation.x += 0.1; },
    rotateY: () => { if (model) model.rotation.y += 0.1; },
    rotateZ: () => { if (model) model.rotation.z += 0.1; },
    translateX: () => { if (model) model.position.x += 0.1; },
    translateY: () => { if (model) model.position.y += 0.1; },
    translateZ: () => { if (model) model.position.z += 0.1; },
};

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            if (action && controls[action]) {
                controls[action]();
            }
        });
    });
});

camera.position.z = 5;

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

animate();