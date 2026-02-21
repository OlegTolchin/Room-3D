import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { setupLights, setupRoomLights, setupLEDStrip } from './lights.js';
import { camera } from './camera.js';

const canvas = document.getElementById('scene');

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

export const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.3;

// Свет
setupLights(scene);

// ===== HDRI =====
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  'textures/hdri_1.exr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
    console.log('HDRI загружен: textures/hdri_1.exr');
  },
  undefined,
  (error) => {
    console.error('HDRI LOAD ERROR', error);
  }
);

// ===== ROOM =====
export let room = null;  // Экспортируем для вращения
const loader = new GLTFLoader();
loader.load(
  'models/room.glb',
  (gltf) => {
    room = gltf.scene;

    // Центрируем модель по Y (только вверх/вниз)
    const box = new THREE.Box3().setFromObject(room);
    const centerY = (box.min.y + box.max.y) / 2;
    room.position.y = -centerY;

    // Инициализируем свет комнаты
    setupRoomLights(room);

    // LED-ленты на ceilinglight_001 - ceilinglight_004
    setupLEDStrip(room);

    scene.add(room);
  },
  undefined,
  (error) => {
    console.error('GLB LOAD ERROR', error);
  }
);

// Resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
